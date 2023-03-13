const database = require('../database');
const { NotFound } = require('../common/errors');

const PlateNumber = database.model('PlateNumber');

exports.postPlateNumber = async (req, res, next) => {
  try {
    // Create new plate number instance from payload.
    const newPlateNumber = new PlateNumber(req.body);
    // Insert a plate number document into database.
    const savedPlateNumber = await newPlateNumber.save();
    // Send the saved plate number to the client.
    res.status(201).json(savedPlateNumber);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getPlateNumber = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count plate number documents by query string.
    const results = await Promise.all([
      PlateNumber.countDocuments(filter),
      PlateNumber.find(filter, fields, options),
    ]);
    // Send array of plate number to the client.
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

/* Get first one plate number document */
exports.getOnePlateNumber = async (req, res, next) => {
  try {
    // Find a plate number document by plate number ID.
    const existPlateNumber = await PlateNumber.findById(req.params.plateNumberId);
    // The resource could not be found?
    if (!existPlateNumber) throw new NotFound('The resource could not be found.');
    // Send the plate number to the client.
    res.status(200).json(existPlateNumber);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putPlateNumber = async (req, res, next) => {
  try {
    // Find and update plate number document by plate number ID.
    const updatedPlateNumber = await PlateNumber.findByIdAndUpdate(req.params.plateNumberId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedPlateNumber) throw new NotFound('The resource could not be found.');
    // Send the updated plate number to the client.
    res.status(200).json(updatedPlateNumber);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deletePlateNumber = async (req, res, next) => {
  try {
    // Find and delete plate number document by plate number ID.
    const deletedPlateNumber = await PlateNumber.findByIdAndDelete(req.params.plateNumberId);
    // The resource could not be found?
    if (!deletedPlateNumber) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
