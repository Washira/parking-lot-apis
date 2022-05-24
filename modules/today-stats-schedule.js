/* eslint-disable max-len */
const { MongoClient } = require('mongodb');
const moment = require('moment');
const nodeSchedule = require('node-schedule');
const uriBuilder = require('mongo-uri-builder');
const logger = require('../common/logger');

// Create mongodb URI connection string.
const uri = uriBuilder({
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  replicas: [],
});

// The mongodb drive conenct options.
const options = { useUnifiedTopology: true };

/**
 * Reset all follow-up flags to false.
 *
 * NOTE: Dispatch changed to Done on Dashboard.
 */
const resetTodayStats = () => new Promise((resolve, reject) => {

  // Create new connection to mongodb server (client).
  new MongoClient(uri, options).connect((connectErr, client) => {

    // When connect error
    if (connectErr) {
      logger.error('[resetTodayStats] unable to connect mongodb.');
      logger.error(connectErr);
      reject(connectErr);
      return;
    }

    // Select database and collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection('tickets');

    // Reset statistics fields if exists
    collection.updateMany({
      $or: [
        { 'custom.today_followup_count': { $exists: true, $gt: 0 } },
        { 'custom.today_followup_lab_count': { $exists: true, $gt: 0 } },
        { 'custom.today_accept_by_uids': { $exists: true, $not: { $size: 0 } } },
        { 'custom.today_dispatch_by_uids': { $exists: true, $not: { $size: 0 } } },
      ],
    }, {
      $set: {
        'custom.today_followup_count': 0,
        'custom.today_followup_lab_count': 0,
        'custom.today_accept_by_uids': [],
        'custom.today_dispatch_by_uids': [],
      },
    }, (updateError, updateResult) => {

      // When update error
      if (updateError) {
        logger.error('[resetTodayStats] An error occurred during updateMany.');
        logger.error(updateError);
        client.close();
        reject(updateError);
        return;
      }

      // When update success
      logger.info(`[resetTodayStats] Reset follow-up flag ${updateResult.modifiedCount} documents.`);
      client.close();
      resolve(updateResult);
    });

  });
});

/**
 * Find follow-up patient/lab within today.
 */
const findTodayDocs = () => new Promise((resolve, reject) => {
  const startOfTodayDate = moment().startOf('day').toDate();
  const endOfTodayDate = moment().endOf('day').toDate();

  // Create new connection to mongodb server (client).
  new MongoClient(uri, options).connect((connectErr, client) => {

    // When connect error
    if (connectErr) {
      logger.error('[findTodayDocs] unable to connect mongodb.');
      logger.error(connectErr);
      reject(connectErr);
      return;
    }

    // Select database and collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection('tickets');

    // Find followup patient or lab today
    collection
      .find({
        'custom.patient_sequence': 1,
        $or: [
          { 'custom.ytd_followup_at': { $gte: startOfTodayDate, $lte: endOfTodayDate } },
          { 'custom.ytd_followup_lab_at': { $gte: startOfTodayDate, $lte: endOfTodayDate } },
        ],
      })
      .toArray((findError, ticketDocs) => {

        // When aggregate error
        if (findError) {
          logger.error('[findTodayDocs] An error occurred during find.');
          logger.error(findError);
          client.close();
          reject(connectErr);
          return;
        }

        // When find success
        logger.info(`[findTodayDocs] Found follow-up today ${ticketDocs.length} documents.`);
        client.close();
        resolve(ticketDocs);

      });
  });
});

/**
 * Flag follow-up patient/lab to true.
 *
 * NOTE: Rama have not much cases per day.
 */
const setTodayStats = (ticketDocs) => new Promise((resolve, reject) => {
  const startOfTodayDate = moment().startOf('day').toDate();
  const endOfTodayDate = moment().endOf('day').toDate();

  // Create new connection to mongodb server (client).
  new MongoClient(uri, options).connect((connectErr, client) => {

    // When connect error
    if (connectErr) {
      logger.error('[setTodayStats] unable to connect mongodb.');
      logger.error(connectErr);
      reject(connectErr);
      return;
    }

    // Select database and collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection('tickets');

    // Loop through array of ticket docs.
    ticketDocs.forEach((ticketDoc, arrayIndex) => {
      let isFollowupPatientToday = false;
      let isFollowupLabToday = false;
      const { ytd_followup_at, ytd_followup_lab_at } = ticketDoc.custom;

      // Detect follow-up patient within today.
      if (ytd_followup_at !== null) {
        isFollowupPatientToday = ytd_followup_at >= startOfTodayDate && ytd_followup_at <= endOfTodayDate;
      }

      // Detect follow-up lab within today.
      if (ytd_followup_lab_at !== null) {
        isFollowupLabToday = ytd_followup_lab_at >= startOfTodayDate && ytd_followup_lab_at <= endOfTodayDate;
      }

      // Update flag single document.
      collection.updateOne({
        _id: ticketDoc._id,
      }, {
        $set: {
          'custom.today_followup_count': isFollowupPatientToday ? 1 : 0,
          'custom.today_followup_lab_count': isFollowupLabToday ? 1 : 0,
        },
      }, (updateError, updateResult) => {

        // When update error
        if (updateError) {
          logger.error('[setTodayStats] An error occurred during updateMany.');
          logger.error(updateError);
          client.close();
          reject(updateError);
        }

        // When find success
        logger.info(`[setTodayStats] Flag follow up today on ${ticketDoc._id}`);

        // When last round
        if (arrayIndex === ticketDocs.length - 1) {
          client.close();
          resolve();
        }

      });
    });

  });
});

/**
 * The main method that organize and executes functions.
 */
const main = async () => {
  try {
    await resetTodayStats();
    const todayFollowupTicketDocs = await findTodayDocs();
    await setTodayStats(todayFollowupTicketDocs);

  } catch (error) {
    logger.error(error);
  }
};

/**
 * Setup the schedule that will trigger every midnight.
 */
const init = () => {
  nodeSchedule.scheduleJob('0 0 0 * * *', () => {
    const datetime = new Date().toLocaleString();
    logger.info(`[today-stats-schedule] the schedule has been triggered at ${datetime}.`);
    main();
  });
};

if (process.env.EXECUTE_TODAY_STATS_SCHEDULE === 'true') {
  main();
}

module.exports = {
  init,
  main,
};
