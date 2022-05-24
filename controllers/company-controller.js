const database = require('../database');
const { NotFound } = require('../common/errors');

const Company = database.model('Company');

exports.postCompany = async (req, res, next) => {
  try {
    // Create new company instance from payload.
    const newCompany = new Company(req.body);
    // Insert a company document into database.
    const savedCompany = await newCompany.save();
    // Send the saved company to the client.
    res.status(201).json(savedCompany);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getCompanies = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count company documents by query string.
    const results = await Promise.all([
      Company.countDocuments(filter),
      Company.find(filter, fields, options),
    ]);
    // Send array of company to the client.
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

exports.getCompany = async (req, res, next) => {
  try {
    // Find a company document by company ID.
    const existCompany = await Company.findById(req.params.companyId);
    // The resource could not be found?
    if (!existCompany) throw new NotFound('The resource could not be found.');
    // Send the company to the client.
    res.status(200).json(existCompany);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putCompany = async (req, res, next) => {
  try {
    // Find and update company document by company ID.
    const updatedCompany = await Company.findByIdAndUpdate(req.params.companyId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedCompany) throw new NotFound('The resource could not be found.');
    // Send the updated company to the client.
    res.status(200).json(updatedCompany);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    // Find and delete company document by company ID.
    const deletedCompany = await Company.findByIdAndDelete(req.params.companyId);
    // The resource could not be found?
    if (!deletedCompany) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
