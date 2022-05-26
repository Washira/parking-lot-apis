const database = require('../database');
const { NotFound } = require('../common/errors');

const DepartmentOwner = database.model('DepartmentOwner');

exports.postDepartmentOwner = async (req, res, next) => {
  try {
    // Create new department owner instance from payload.
    const newDepartmentOwner = new DepartmentOwner(req.body);
    // Insert a department owner document into database.
    const savedDepartmentOwner = await newDepartmentOwner.save();
    // Send the saved department owner to the client.
    res.status(201).json(savedDepartmentOwner);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getDepartmentOwners = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count department owner documents by query string.
    const results = await Promise.all([
      DepartmentOwner.countDocuments(filter),
      DepartmentOwner.find(filter, fields, options),
    ]);
    // Send array of department owner to the client.
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

exports.getDepartmentOwner = async (req, res, next) => {
  try {
    // Find a department owner document by department owner ID.
    const existDepartmentOwner = await DepartmentOwner.findById(req.params.departmentOwnerId);
    // The resource could not be found?
    if (!existDepartmentOwner) throw new NotFound('The resource could not be found.');
    // Send the department owner to the client.
    res.status(200).json(existDepartmentOwner);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putDepartmentOwner = async (req, res, next) => {
  try {
    // Find and update department owner document by department owner ID.
    const updatedDepartmentOwner = await DepartmentOwner.findByIdAndUpdate(
      req.params.departmentOwnerId,
      req.body, { runValidators: true, new: true },
    );
    // The resource could not be found?
    if (!updatedDepartmentOwner) throw new NotFound('The resource could not be found.');
    // Send the updated department owner to the client.
    res.status(200).json(updatedDepartmentOwner);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteDepartmentOwner = async (req, res, next) => {
  try {
    // Find and delete department owner document by department owner ID.
    const deletedDepartmentOwner = await DepartmentOwner.findByIdAndDelete(
      req.params.departmentOwnerId,
    );
    // The resource could not be found?
    if (!deletedDepartmentOwner) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
