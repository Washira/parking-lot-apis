const database = require('../database');
const { NotFound } = require('../common/errors');

const ProjectStatus = database.model('ProjectStatus');

exports.postProjectStatus = async (req, res, next) => {
  try {
    // Create new project status Status instance from payload.
    const newProjectStatus = new ProjectStatus(req.body);
    // Insert a project status document into database.
    const savedProjectStatus = await newProjectStatus.save();
    // Send the saved project status to the client.
    res.status(201).json(savedProjectStatus);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getProjectStatuses = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count project status documents by query string.
    const results = await Promise.all([
      ProjectStatus.countDocuments(filter),
      ProjectStatus.find(filter, fields, options),
    ]);
    // Send array of project status to the client.
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

exports.getProjectStatus = async (req, res, next) => {
  try {
    // Find a project status document by project status ID.
    const existProjectStatus = await ProjectStatus.findById(req.params.projectStatusId);
    // The resource could not be found?
    if (!existProjectStatus) throw new NotFound('The resource could not be found.');
    // Send the project status to the client.
    res.status(200).json(existProjectStatus);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putProjectStatus = async (req, res, next) => {
  try {
    // Find and update project status document by project status ID.
    const updatedProjectStatus = await ProjectStatus.findByIdAndUpdate(req.params.projectStatusId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedProjectStatus) throw new NotFound('The resource could not be found.');
    // Send the updated project status to the client.
    res.status(200).json(updatedProjectStatus);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteProjectStatus = async (req, res, next) => {
  try {
    // Find and delete project status document by project status ID.
    const deletedProjectStatus = await ProjectStatus.findByIdAndDelete(req.params.projectStatusId);
    // The resource could not be found?
    if (!deletedProjectStatus) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
