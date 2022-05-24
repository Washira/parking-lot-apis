const Dot = require('dot-object');

const dotObject = new Dot('.', false, true, false);
const database = require('../database');
const { NotFound } = require('../common/errors');
const cleanEmptyProps = require('../core/clean-empty-props');

const Hospital = database.model('Hospital');

exports.postHospital = async (req, res, next) => {
  try {
    // Create new hospital instance from payload.
    const newHospital = new Hospital(req.body);
    // Insert a hospital document into database.
    const savedHospital = await newHospital.save();
    // Send the saved hospital to the client.
    res.status(201).json(savedHospital);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getHospitals = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count hospital documents by query string.
    const results = await Promise.all([
      Hospital.countDocuments(filter),
      Hospital.find(filter, fields, options),
    ]);
    // Send array of hospital to the client.
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

exports.getHospital = async (req, res, next) => {
  try {
    // Find a hospital document by hospital ID.
    const existHospital = await Hospital.findById(req.params.hospitalId);
    // The resource could not be found?
    if (!existHospital) throw new NotFound('The resource could not be found.');
    // Send the hospital to the client.
    res.status(200).json(existHospital);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putHospital = async (req, res, next) => {
  try {
    // Find and update hospital document by hospital ID.
    const updatedHospital = await Hospital.findByIdAndUpdate(req.params.hospitalId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedHospital) throw new NotFound('The resource could not be found.');
    // Send the updated hospital to the client.
    res.status(200).json(updatedHospital);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteHospital = async (req, res, next) => {
  try {
    // Find and delete hospital document by hospital ID.
    const deletedHospital = await Hospital.findByIdAndDelete(req.params.hospitalId);
    // The resource could not be found?
    if (!deletedHospital) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
