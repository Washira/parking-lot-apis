/* eslint-disable prefer-destructuring */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
const uriBuilder = require('mongo-uri-builder');
const moment = require('moment');
const { MongoClient, ObjectId } = require('mongodb');
const { get } = require('lodash');
const logger = require('../common/logger');

// eslint-disable-next-line no-unused-vars
const jsonTickets = require('../data/tickets.json');
const jsonAgents = require('../data/agents.json');

const ticketsObject = {};

// Uncomment this when migration (wasted memory on startup).
// for (let i = 0; i < jsonTickets.length; i++) {
//   const key = jsonTickets[i].reference_id;
//   ticketsObject[key] = jsonTickets[i]._id.$oid;
// }

exports.getExecuteUpdatePatientSequence = async (req, res, next) => {

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const collection = mongoClient.db().collection('tickets');

    // Saving reccent YTD outside the loop.
    let recentYtdNumber = '';
    let patientSequence = 0;

    // Find all tickets sort by YTD.
    const findCondition = {};
    const findOptions = { sort: 'custom.ytd_code' };
    collection.find(findCondition, findOptions).forEach((ticketDocument) => {

      // When found new YTD reset patient sequence to 1
      if (ticketDocument.custom.ytd_code !== recentYtdNumber) {
        patientSequence = 1;
      }

      // When found duplicate YTD plus patient sequence
      if (ticketDocument.custom.ytd_code === recentYtdNumber) {
        patientSequence += 1;
      }

      // Update the recent YTD number tracker.
      recentYtdNumber = ticketDocument.custom.ytd_code;

      // Special updating fields for 1st patient.
      let updateOperation;

      if (patientSequence === 1) {
        updateOperation = {
          $set: {
            'custom.patient_sequence': patientSequence,
            'custom.ytd_status': ticketDocument.status,
            'custom.ytd_followup_at': ticketDocument.custom.followup_schedule_at || null,
            'custom.ytd_followup_lab_at': ticketDocument.custom.followup_lab_schedule_at || null,
          },
        };
      } else {
        updateOperation = {
          $set: { 'custom.patient_sequence': patientSequence },
        };
      }

      // Sends updateOne commands to MongoDB Server.
      const updateCondition = { _id: ticketDocument._id };
      collection.updateOne(updateCondition, updateOperation)
        .catch((err) => {
          console.error(err);
        });
    });

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all updateOne operations to the MongoDB server. <br />
      Just wait few minutes then use MongoDB Compass sort tickets descending { _id: -1 } <br />
      When the last document has "custom.patient_sequence" you can asume that all tickets has been updated.
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getExecuteAddSameYtdTickets = async (req, res, next) => {

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const collection = mongoClient.db().collection('tickets');

    // Find first patient tickets sort by YTD.
    const findAllCondition = {
      $or: [
        { 'custom.same_ytd_tickets': { $exists: false } },
        { 'custom.same_ytd_tickets': { $eq: [] } },
      ],
    };
    const findAllOptions = {
      sort: { 'custom.ytd_code': 1 },
      projection: { _id: 1, 'custom.ytd_code': 1, 'custom.patient_sequence': 1 },
    };
    const ticketDocuments = await collection.find(findAllCondition, findAllOptions).toArray();

    // Loop through the all ticket documents.
    for (let i = 0; i < ticketDocuments.length; i++) {

      // Print some logs for developer monitoring.
      if (i % 10000 === 0) {
        logger.info(`Remaining work ${(ticketDocuments.length) - i} documents.`);
      }

      // Assign new field with empty array.
      ticketDocuments[i].custom.same_ytd_tickets = [];

      // For "first patient tickets" push it own id and child id.
      if (ticketDocuments[i].custom.patient_sequence === 1) {
        const startSearchIndex = i;
        const endSearchIndex = i + 250;
        const limitSearchIndex = endSearchIndex < ticketDocuments.length ? endSearchIndex : ticketDocuments.length;
        for (let j = startSearchIndex; j < limitSearchIndex; j++) {
          if (ticketDocuments[i].custom.ytd_code === ticketDocuments[j].custom.ytd_code) {
            ticketDocuments[i].custom.same_ytd_tickets.push(ticketDocuments[j]._id);
          }
        }
      }

      // For "second patient tickets++" push it own id only
      if (ticketDocuments[i].custom.patient_sequence >= 2) {
        const startSearchIndex = i;
        const limitSearchIndex = i + 1;
        for (let j = startSearchIndex; j < limitSearchIndex; j++) {
          if (ticketDocuments[i].custom.ytd_code === ticketDocuments[j].custom.ytd_code) {
            ticketDocuments[i].custom.same_ytd_tickets.push(ticketDocuments[j]._id);
          }
        }
      }

      // Sends updateOne commands to MongoDB Server.
      const updateCondition = { _id: ticketDocuments[i]._id };
      const updateOperation = { $set: { 'custom.same_ytd_tickets': ticketDocuments[i].custom.same_ytd_tickets } };
      collection.updateOne(updateCondition, updateOperation)
        .catch((err) => {
          console.error(err);
        });
    }

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all updateOne operations to the MongoDB server. <br />
      Just wait few minutes then use MongoDB Compass sort tickets descending { _id: -1 } <br />
      When the last document has "custom.same_ytd_tickets" you can asume that all tickets has been updated.
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getExecuteAddYtdPatients = async (req, res, next) => {

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const collection = mongoClient.db().collection('tickets');

    // Find first patient tickets sort by YTD.
    const findCondition = {
      'custom.patient_sequence': 1,
      $or: [
        { 'custom.ytd_patients': { $exists: false } },
        { 'custom.ytd_patients': { $eq: [] } },
      ],
    };
    const findOptions = {
      sort: { 'custom.ytd_code': 1 },
      projection: {
        _id: 1,
        'custom.ytd_code': 1,
      },
    };
    collection.find(findCondition, findOptions).forEach(async (ticketDocument) => {
      logger.warn('ticketDocument.custom.ytd_code:', ticketDocument.custom.ytd_code);

      // Find all tickets that has same YTD.
      const childTickets = await collection.find({
        'custom.ytd_code': ticketDocument.custom.ytd_code,
      }, {
        projection: {
          'custom.patient.name': 1,
          'custom.patient.CustomData.pid': 1,
        },
      }).toArray();

      // Maps tickets array to small patient array.
      const ytdPatients = childTickets.map((t) => {
        return {
          pid: get(t, 'custom.patient.CustomData.pid', ''),
          name: get(t, 'custom.patient.name', ''),
        };
      });

      // Add field `custom.ytd_patients` array.
      const updateCondition = { _id: ticketDocument._id };
      const updateOperation = { $set: { 'custom.ytd_patients': ytdPatients } };
      collection.updateOne(updateCondition, updateOperation)
        .catch((err) => {
          console.error(err);
        });

    });

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all updateOne operations to the MongoDB server. <br />
      Just wait few minutes then use MongoDB Compass sort tickets descending { _id: -1 } <br />
      When the last document has "custom.ytd_patients" you can asume that all tickets has been updated.
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getExecuteMigrateFollowupActivities = async (req, res, next) => {

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const ticket_logs = mongoClient.db().collection('ticket_logs');
    const activities = mongoClient.db().collection('activities');

    // Drop the activities collection.
    await activities.deleteMany();

    // Find all follow-up ticket_logs.
    const findCondition = { imind_contact_flow: true, desc_en: /Follow up date /i };
    const findOptions = {};
    ticket_logs.find(findCondition, findOptions).forEach((ticket_log) => {

      // Find and correct date format.
      const imindFollowupDateText = ticket_log.desc_en.substring(15, 34);
      const creamFollowupDate = moment(imindFollowupDateText, 'DD-MMM-YYYY HH:mm').toDate();

      // Create an follow-up activity.
      activities.insert({
        ticket_id: ticket_log.ticket_id,
        channel: null,
        content: ticket_log.desc_en,
        person: ticket_log.person,
        is_public: true,
        is_active: true,
        call_ext: null,
        call_phone: null,
        call_start_time: null,
        call_survey_scores: [],
        followup_at: creamFollowupDate,
        followup_status: ticket_log.imind_ack_flag,
        followup_lab_at: null,
        followup_lab_status: false,
        created_at: ticket_log.created_at,
        updatedAt: ticket_log.created_at,
      });
    });

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all insert operations to the MongoDB server. <br />
      Just wait few minutes then use MongoDB Compass to check your activities records.
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getExecuteAttachTicketIdToTicketLogs = async (req, res, next) => {

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const ticket_logs_collection = mongoClient.db().collection('import_ticket_logs');

    const findCondition = { ticket_id: { $exists: false } };
    const findOptions = {};
    ticket_logs_collection.find(findCondition, findOptions).sort({ _id: 1 }).forEach((ticket_log) => {

      const ticket_id = ticketsObject[ticket_log.request_id];

      if (ticket_id) {
        ticket_logs_collection.updateOne({
          _id: ticket_log._id,
        }, {
          $set: {
            // eslint-disable-next-line object-shorthand
            ticket_id: ticket_id,
          },
        });
      }
    });

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all updateOne operations to the MongoDB server. <br />
      Just wait few minutes then use MongoDB Compass to check last activities records ticket_id should be added.
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getExecuteAttachPersonToTicketLogs = async (req, res, next) => {

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const ticket_logs_collection = mongoClient.db().collection('import_ticket_logs');

    const findCondition = { person: { $exists: false } };
    const findOptions = {};
    ticket_logs_collection.find(findCondition, findOptions).sort({ _id: 1 }).forEach((ticket_log) => {

      const agent = jsonAgents.find((item) => item.CustomData.imindPersonId === ticket_log.action_by);

      if (agent) {
        ticket_logs_collection.updateOne({
          _id: ticket_log._id,
        }, {
          $set: {
            person: {
              _id: agent._id.$oid,
              name: agent.name,
            },
          },
        });
      }
    });

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all updateOne operations to the MongoDB server. <br />
      Just wait few minutes then use MongoDB Compass to check last activities records person should be added.
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getExecuteRemoveDuplicateSubstanceList = async (req, res, next) => {

  // A inner function detect duplicate substance.
  // eslint-disable-next-line no-unused-vars
  const isDuplicateSubstance = (substance_list = [], productId, productIdIndex) => {
    let isDuplicate = false;

    // Loop through the substance list.
    for (let i = 0; i < substance_list.length; i++) {
      // Check only above items.
      if (i === productIdIndex) break;
      // Checking the duplicate.
      const item = substance_list[i];
      if (item.substance && item.substance.old_product_id
        === productId && i !== productIdIndex) {
        isDuplicate = true;
      }
    }
    return isDuplicate;
  };

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const TicketsCollection = mongoClient.db().collection('tickets');
    const RequestProductsCollection = mongoClient.db().collection('request_product_202101_1566');

    // Find all tickets specific fields.
    // const findTicketsCondition = { 'custom.ytd_code': '2559-001347', 'custom.patient_sequence': 1 };
    const findTicketsCondition = { created_at: { $lte: new Date('2022-01-19T02:05:00.000+00:00') } };
    const findTicketsProjection = { reference_id: 1, 'custom.patient.CustomData.imindPersonId': 1 };

    // Get total entries to process.
    const totalEntries = await TicketsCollection.find(findTicketsCondition).count();
    logger.debug(`Total ${totalEntries} entries.`);

    // Loop through migrated tickets.
    let index = 1;
    TicketsCollection.find(findTicketsCondition).project(findTicketsProjection).forEach((ticket) => {
      const referenceId = get(ticket, 'reference_id') || undefined;
      const patientId = get(ticket, 'custom.patient.CustomData.imindPersonId') || undefined;

      // Find match request_id and patient_id.
      const findSubstanceExposuresCondition = { request_id: referenceId, patient_id: patientId };
      RequestProductsCollection.find(findSubstanceExposuresCondition).toArray()
        .then((substanceExposures) => {

          // Replace the ticket.custom.substance_list array.
          TicketsCollection.updateOne({ _id: ticket._id }, {
            $set: {
              'custom.substance_list': substanceExposures,
              'custom.fixed_duplicate_substance_list': true,
            },
          })
            .catch((error) => {
              logger.error('Unable to find updateOne $set.substance_list');
              logger.error(error);
            });

        })
        .catch((error) => {
          logger.error('Unable to find substance exposures.');
          logger.error(error);
        });

      index += 1;
      if (index % 5000 === 0) {
        logger.debug(`Processed ${index} entries.`);
      } else if (index === totalEntries) {
        logger.debug(`Processed ${index} entries.`);
      }
    });

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all updateOne operations to the MongoDB server. <br />
      Just wait few minutes then use MongoDB Compass to check the YTD that have duplicate substance_list issue.
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getExecuteFixCreatedAtTimezone = async (req, res, next) => {

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const TicketsCollection = mongoClient.db().collection('tickets');
    const TempTicketsCollection = mongoClient.db().collection('import_ticket_Temp_15_Fixed_Created_at');

    // Find all tickets specific fields.
    const findTicketsCondition = { reference_id: { $exists: true } };
    const findTicketsProjection = { reference_id: 1 };

    // Get total entries to process.
    const totalEntries = await TicketsCollection.find(findTicketsCondition).count();
    logger.debug(`Total ${totalEntries} entries.`);

    // Loop through migrated tickets.
    let index = 1;
    TicketsCollection.find(findTicketsCondition).project(findTicketsProjection).forEach((ticket) => {
      const referenceId = get(ticket, 'reference_id') || undefined;

      // Find match request_id and patient_id.
      const findTempTicketsCondition = { reference_id: referenceId };
      TempTicketsCollection.findOne(findTempTicketsCondition)
        .then((tempTicket) => {

          // Replace the tickets.created_at from temp collection.
          TicketsCollection.updateOne({ _id: ticket._id }, {
            $set: { created_at: tempTicket.created_at },
          })
            .catch((error) => {
              logger.error('Unable to find updateOne $set.created_at');
              logger.error(error);
            });

        })
        .catch((error) => {
          logger.error('Unable to find temp tickets by reference_id.');
          logger.error(error);
        });

      index += 1;
      if (index % 5000 === 0) {
        logger.debug(`Processed ${index} entries.`);
      } else if (index === totalEntries) {
        logger.debug(`Processed ${index} entries.`);
      }
    });

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all updateOne operations to the MongoDB server. <br />
      Just wait few minutes then use MongoDB Compass to check the created_at timezone should be corrected.
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

// Detect most used contact points associated in tickets.
// by passing the simalar contact points array.
const detectMostUsageContactPoint = async (mongoClient, contactPoints) => {
  const TicketsCollection = mongoClient.db().collection('tickets');
  for (let i = 0; i < contactPoints.length; i++) {
    const contactPoint = contactPoints[i];
    const fineQuery = {
      $or: [
        { 'custom.contact_point._id': ObjectId(contactPoint._id.toString()) },
        { 'custom.contact_point._id': contactPoint._id.toString() },
      ],
    };
    const usedTickets = await TicketsCollection.find(fineQuery).toArray();
    contactPoints[i].usageCount = usedTickets.length;
  }
  // Sort descending usageCount contact points.
  contactPoints.sort((a, b) => (a.usageCount < b.usageCount ? 1 : -1));
  // Delete the new property before return.
  contactPoints = contactPoints.map((contactPoint) => {
    delete contactPoint.usageCount;
    return contactPoint;
  });
  // Return the most selected contact point in tickets.
  return contactPoints[0];
};

exports.getExecuteFixDuplicateContactPoints = async (req, res, next) => {
  const sundayMidnightDate = new Date('2022-02-05T17:00:00.000+00:00');
  const sundayAfterFixDate = new Date('2022-02-06T09:00:00.000+00:00');

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const TicketsCollection = mongoClient.db().collection('tickets');
    const PersonsCollection = mongoClient.db().collection('person');

    // Filter for the target tickets.
    const findTicketsCondition = {
      created_at: {
        $gte: sundayMidnightDate,
        $lte: sundayAfterFixDate,
      },
      'custom.fixed_duplicate_contact': {
        $exists: false,
      },
    };

    // Projection the target tickets.
    const findTicketsProjection = {
      contacts: 1,
      'custom.contact_point': 1,
      'custom.first_caller': 1,
    };

    // Load all target tickets into memory.
    let targetTickets = await TicketsCollection.find(findTicketsCondition)
      .project(findTicketsProjection)
      .toArray();

    // Filter only tickets that user still not resolve.
    targetTickets = targetTickets.filter((targetTicket) => {
      const ticketContactPointCreateAt = new Date(targetTicket.custom.contact_point.createAt);
      if (ticketContactPointCreateAt < sundayMidnightDate) return false;
      return true;
    });

    // Get total entries to process.
    logger.debug(`Total ${targetTickets.length} entries.`);

    // Loop through the target tickets.
    for (let index = 0; index < targetTickets.length; index++) {
      const ticket = targetTickets[index];
      const ticketContactPoint = ticket.custom.contact_point;
      const ticketCaller = ticket.contacts[0];
      let replaceContactPoint;

      // Due to Rama has 2 naming styles "having space after dot" and "non-space after dot"
      const resetTicketContactPointName = ticketContactPoint.name.replace('. ', '.');
      const duplicateContactPointName = resetTicketContactPointName;

      // The filter expecting contact points except it own.
      const findContactPointsCondition = {
        'CustomData.contactType': { $eq: 'ACCOUNT' },
        _id: { $ne: ObjectId(ticketContactPoint._id) },
        $or: [
          { name: { $eq: duplicateContactPointName } },
          { name: { $eq: duplicateContactPointName.replace('.', '. ') } },
        ],
      };

      // Find the original contact points.
      const arrayContactPoints = await PersonsCollection.find(findContactPointsCondition).toArray();

      // No similar contact points (new contact point)
      if (arrayContactPoints.length === 0) {
        logger.info('No similar contact points (new contact point):', ticket._id);
        continue;
      }

      // Found a similar contact points (use for replace)
      if (arrayContactPoints.length === 1) {
        logger.info('Found a similar contact points (use for replace):', ticket._id);
        replaceContactPoint = arrayContactPoints[0];
      }

      // Found many similar contact points (detect which one)
      if (arrayContactPoints.length > 1) {
        logger.info('Found many similar contact points (find which one):', ticket._id);
        replaceContactPoint = await detectMostUsageContactPoint(mongoClient, arrayContactPoints);
      }

      // Find child callers for reaplce.
      const childCallers = await PersonsCollection.find({ parentId: replaceContactPoint._id.toString() })
        .sort({ 'CustomData.defaultFlag': -1, 'CustomData.order': 1 })
        .toArray();

      // Debug log not found any caller under contact point.
      if (childCallers.length === 0) {
        logger.error('Not found any caller please check ticket:', ticket._id);
      }

      // Find same name from child callers.
      const foundExistCaller = childCallers.find((c) => c.name === ticketCaller.name);

      // Declare replacing caller and first-caller.
      const reaplceCaller = foundExistCaller || ticketCaller;
      const replaceFirstCaller = childCallers[0];

      // Converts all _id to normal string.
      replaceContactPoint._id = replaceContactPoint._id.toString();
      reaplceCaller._id = reaplceCaller._id.toString();
      replaceFirstCaller._id = replaceFirstCaller._id.toString();

      // Update specific fields via ticket id.
      TicketsCollection.updateOne({ _id: ticket._id }, {
        $set: {
          contacts: [reaplceCaller],
          'custom.contact_point': replaceContactPoint,
          'custom.first_caller': replaceFirstCaller,
          'custom.fixed_duplicate_contact': true,
        },
      })
        .catch((error) => {
          logger.error('Unable to updateOne the ticket.');
          logger.error(error);
        });

      // In case new caller update master person.parentId
      if (!foundExistCaller) {
        // Replace the new caller parentId on master table.
        PersonsCollection.updateOne({ _id: ticketCaller._id }, {
          $set: {
            parentId: replaceContactPoint._id,
          },
        })
          .catch((error) => {
            logger.error('Unable to updateOne master person.');
            logger.error(error);
          });
      }

      // Non-await loop statistic
      if (index % 10 === 0) {
        logger.debug(`Processed ${index} entries.`);
      } else if (index === targetTickets.length) {
        logger.debug(`Processed ${index} entries.`);
      }
    }

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all updateOne operations to the MongoDB server.<br />
      Just wait few minutes then use MongoDB Compass to check your expected results.<br />
      <strong>Don't forget to delete the master contact points \`/api/v1/scripts/execute-remove-unused-persons\`</strong>
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getExecuteDeleteUnusedContactPoints = async (req, res, next) => {
  const sundayMidnightDate = new Date('2022-02-05T17:00:00.000+00:00');
  const sundayAfterFixDate = new Date('2022-02-06T09:00:00.000+00:00');

  // Create MongoDB URI connection string.
  const connectURI = uriBuilder({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    replicas: [],
  });

  // Create a MongoDB client instance.
  const mongoClient = new MongoClient(connectURI, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server.
    await mongoClient.connect();
    const PersonsCollection = mongoClient.db().collection('person');
    const TicketsCollection = mongoClient.db().collection('tickets');

    // Find contact points based on createAt
    const findContactPointsProjection = { _id: 1 };
    const findContactPointsCondition = {
      'CustomData.contactType': 'ACCOUNT',
      createAt: {
        $gte: sundayMidnightDate,
        $lte: sundayAfterFixDate,
      },
    };

    // Get total entries to process.
    const totalEntries = await PersonsCollection.find(findContactPointsCondition).count();
    logger.debug(`Total ${totalEntries} entries.`);

    // Loop through sunday contact points.
    let index = 1;
    PersonsCollection.find(findContactPointsCondition)
      .project(findContactPointsProjection).forEach((contactPoint) => {

        // Find usedTickets tickets.custom.contact_point_id
        TicketsCollection.findOne({
          $or: [
            { 'custom.contact_point._id': ObjectId(contactPoint._id.toString()) },
            { 'custom.contact_point._id': contactPoint._id.toString() },
          ],
        })
          .then((usedTicket) => {

            // Delete the master contact point.
            if (!usedTicket) {
              logger.info('Not in use delete contact point:', contactPoint._id);
              PersonsCollection.deleteOne({ _id: contactPoint._id })
                .catch((error) => {
                  logger.error('Unable to deleteOne contact point.');
                  logger.error(error);
                });
            } else {
              logger.info('Found contact point is in use:', contactPoint._id);
            }

          })
          .catch((error) => {
            logger.error('Unable to findOne contact point.');
            logger.error(error);
          });

        index += 1;
        if (index % 5000 === 0) {
          logger.debug(`Processed ${index} entries.`);
        } else if (index === totalEntries) {
          logger.debug(`Processed ${index} entries.`);
        }
      });

    // Return a message to the client.
    res.send(`
      The ubuntu has been connected and sent all deleteOne operations to the MongoDB server. <br />
      Just wait few minutes then use MongoDB Compass to check expected delete contact points.
    `);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
