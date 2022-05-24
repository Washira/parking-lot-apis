const Dot = require('dot-object');

const dotObject = new Dot('.', false, true, false);
const database = require('../database');
const { NotFound } = require('../common/errors');
const cleanEmptyProps = require('../core/clean-empty-props');

const Patient = database.model('Patient');

exports.postPatient = async (req, res, next) => {
  try {
    // Create new patient instance from payload.
    const newPatient = new Patient(req.body);
    // Insert a patient document into database.
    const savedPatient = await newPatient.save();
    // Send the saved patient to the client.
    res.status(201).json(savedPatient);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getPatients = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count patient documents by query string.
    const results = await Promise.all([
      Patient.countDocuments(filter),
      Patient.find(filter, fields, options),
    ]);
    // Send array of patient to the client.
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

exports.getPatient = async (req, res, next) => {
  try {
    // Find a patient document by patient ID.
    const existPatient = await Patient.findById(req.params.patientId);
    // The resource could not be found?
    if (!existPatient) throw new NotFound('The resource could not be found.');
    // Send the patient to the client.
    res.status(200).json(existPatient);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putPatient = async (req, res, next) => {
  try {
    // Find and update patient document by patient ID.
    const updatedPatient = await Patient.findByIdAndUpdate(req.params.patientId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedPatient) throw new NotFound('The resource could not be found.');
    // Send the updated patient to the client.
    res.status(200).json(updatedPatient);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    // Find and delete patient document by patient ID.
    const deletedPatient = await Patient.findByIdAndDelete(req.params.patientId);
    // The resource could not be found?
    if (!deletedPatient) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
