const database = require('../database');
const { NotFound } = require('../common/errors');

const Interest = database.model('Interest');

exports.postInterest = async (req, res, next) => {
  try {
    // Create new interest instance from payload.
    const newInterest = new Interest(req.body);
    // Insert a interest document into database.
    const savedInterest = await newInterest.save();
    // Send the saved interest to the client.
    res.status(201).json(savedInterest);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getInterests = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count interest documents by query string.
    const results = await Promise.all([
      Interest.countDocuments(filter),
      Interest.find(filter, fields, options),
    ]);
    // Send array of interest to the client.
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

exports.getInterest = async (req, res, next) => {
  try {
    // Find a interest document by interest ID.
    const existInterest = await Interest.findById(req.params.interestId);
    // The resource could not be found?
    if (!existInterest) throw new NotFound('The resource could not be found.');
    // Send the interest to the client.
    res.status(200).json(existInterest);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putInterest = async (req, res, next) => {
  try {
    // Find and update interest document by interest ID.
    const updatedInterest = await Interest.findByIdAndUpdate(req.params.interestId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedInterest) throw new NotFound('The resource could not be found.');
    // Send the updated interest to the client.
    res.status(200).json(updatedInterest);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteInterest = async (req, res, next) => {
  try {
    // Find and delete interest document by interest ID.
    const deletedInterest = await Interest.findByIdAndDelete(req.params.interestId);
    // The resource could not be found?
    if (!deletedInterest) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
