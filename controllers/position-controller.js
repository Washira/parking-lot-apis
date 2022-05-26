const database = require('../database');
const { NotFound } = require('../common/errors');

const Position = database.model('Position');

exports.postPosition = async (req, res, next) => {
  try {
    // Create new position instance from payload.
    const newPosition = new Position(req.body);
    // Insert a position document into database.
    const savedPosition = await newPosition.save();
    // Send the saved position to the client.
    res.status(201).json(savedPosition);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getPositions = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count position documents by query string.
    const results = await Promise.all([
      Position.countDocuments(filter),
      Position.find(filter, fields, options),
    ]);
    // Send array of position to the client.
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

exports.getPosition = async (req, res, next) => {
  try {
    // Find a position document by position ID.
    const existPosition = await Position.findById(req.params.positionId);
    // The resource could not be found?
    if (!existPosition) throw new NotFound('The resource could not be found.');
    // Send the position to the client.
    res.status(200).json(existPosition);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putPosition = async (req, res, next) => {
  try {
    // Find and update position document by position ID.
    const updatedPosition = await Position.findByIdAndUpdate(req.params.positionId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedPosition) throw new NotFound('The resource could not be found.');
    // Send the updated position to the client.
    res.status(200).json(updatedPosition);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deletePosition = async (req, res, next) => {
  try {
    // Find and delete position document by position ID.
    const deletedPosition = await Position.findByIdAndDelete(req.params.positionId);
    // The resource could not be found?
    if (!deletedPosition) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
