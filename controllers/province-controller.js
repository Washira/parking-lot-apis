const database = require('../database');
const { NotFound } = require('../common/errors');

const Province = database.model('Province');

exports.postProvince = async (req, res, next) => {
  try {
    // Create new province instance from payload.
    const newProvince = new Province(req.body);
    // Insert a province document into database.
    const savedProvince = await newProvince.save();
    // Send the saved province to the client.
    res.status(201).json(savedProvince);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getProvinces = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count province documents by query string.
    const results = await Promise.all([
      Province.countDocuments(filter),
      Province.find(filter, fields, options),
    ]);
    // Send array of province to the client.
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

exports.getProvince = async (req, res, next) => {
  try {
    // Find a province document by province ID.
    const existProvince = await Province.findById(req.params.provinceId);
    // The resource could not be found?
    if (!existProvince) throw new NotFound('The resource could not be found.');
    // Send the province to the client.
    res.status(200).json(existProvince);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putProvince = async (req, res, next) => {
  try {
    // Find and update province document by province ID.
    const updatedProvince = await Province.findByIdAndUpdate(req.params.provinceId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedProvince) throw new NotFound('The resource could not be found.');
    // Send the updated province to the client.
    res.status(200).json(updatedProvince);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteProvince = async (req, res, next) => {
  try {
    // Find and delete province document by province ID.
    const deletedProvince = await Province.findByIdAndDelete(req.params.provinceId);
    // The resource could not be found?
    if (!deletedProvince) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
