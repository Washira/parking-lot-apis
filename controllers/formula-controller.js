const Dot = require('dot-object');

const dotObject = new Dot('.', false, true, false);
const database = require('../database');
const { NotFound } = require('../common/errors');
const cleanEmptyProps = require('../core/clean-empty-props');

const Formula = database.model('Formula');

exports.postFormula = async (req, res, next) => {
  try {
    // Create new formula instance from payload.
    const newFormula = new Formula(req.body);
    // Insert a formula document into database.
    const savedFormula = await newFormula.save();
    // Send the saved formula to the client.
    res.status(201).json(savedFormula);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getFormulas = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count formula documents by query string.
    const results = await Promise.all([
      Formula.countDocuments(filter),
      Formula.find(filter, fields, options),
    ]);
    // Send array of formula to the client.
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

exports.getFormula = async (req, res, next) => {
  try {
    // Find a formula document by formula ID.
    const existFormula = await Formula.findById(req.params.formulaId);
    // The resource could not be found?
    if (!existFormula) throw new NotFound('The resource could not be found.');
    // Send the formula to the client.
    res.status(200).json(existFormula);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putFormula = async (req, res, next) => {
  try {
    // Find and update formula document by formula ID.
    const updatedFormula = await Formula.findByIdAndUpdate(req.params.formulaId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedFormula) throw new NotFound('The resource could not be found.');
    // Send the updated formula to the client.
    res.status(200).json(updatedFormula);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteFormula = async (req, res, next) => {
  try {
    // Find and delete formula document by formula ID.
    const deletedFormula = await Formula.findByIdAndDelete(req.params.formulaId);
    // The resource could not be found?
    if (!deletedFormula) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
