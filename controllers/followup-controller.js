const database = require('../database');
const { NotFound } = require('../common/errors');

const Followup = database.model('Followup');

exports.postFollowup = async (req, res, next) => {
  try {
    // Create new followup instance from payload.
    const newFollowup = new Followup(req.body);
    // Insert a followup document into database.
    const savedFollowup = await newFollowup.save();
    // Send the saved followup to the client.
    res.status(201).json(savedFollowup);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getFollowups = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count followup documents by query string.
    const results = await Promise.all([
      Followup.countDocuments(filter),
      Followup.find(filter, fields, options),
    ]);
    // Send array of followup to the client.
    res.status(200).json({
      total: results[0],
      page: options.skip / options.limit || 0,
      data: results[1],
    });

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getFollowup = async (req, res, next) => {
  try {
    // Find a followup document by followup ID.
    const existFollowup = await Followup.findById(req.params.followupId);
    // The resource could not be found?
    if (!existFollowup) throw new NotFound('The resource could not be found.');
    // Send the followup to the client.
    res.status(200).json(existFollowup);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putFollowup = async (req, res, next) => {
  try {
    // Find and update followup document by followup ID.
    const updatedFollowup = await Followup.findByIdAndUpdate(req.params.followupId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedFollowup) throw new NotFound('The resource could not be found.');
    // Send the updated followup to the client.
    res.status(200).json(updatedFollowup);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteFollowup = async (req, res, next) => {
  try {
    // Find and delete followup document by followup ID.
    const deletedFollowup = await Followup.findByIdAndDelete(req.params.followupId);
    // The resource could not be found?
    if (!deletedFollowup) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
