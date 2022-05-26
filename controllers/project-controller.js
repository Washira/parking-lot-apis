const database = require('../database');
const { NotFound } = require('../common/errors');

const Project = database.model('Project');

exports.postProject = async (req, res, next) => {
  try {
    // Create new project instance from payload.
    const newProject = new Project(req.body);
    // Insert a project document into database.
    const savedProject = await newProject.save();
    // Send the saved project to the client.
    res.status(201).json(savedProject);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count project documents by query string.
    const results = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter, fields, options),
    ]);
    // Send array of project to the client.
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

exports.getProject = async (req, res, next) => {
  try {
    // Find a project document by project ID.
    const existProject = await Project.findById(req.params.projectId);
    // The resource could not be found?
    if (!existProject) throw new NotFound('The resource could not be found.');
    // Send the project to the client.
    res.status(200).json(existProject);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putProject = async (req, res, next) => {
  try {
    // Find and update project document by project ID.
    const updatedProject = await Project.findByIdAndUpdate(req.params.projectId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedProject) throw new NotFound('The resource could not be found.');
    // Send the updated project to the client.
    res.status(200).json(updatedProject);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    // Find and delete project document by project ID.
    const deletedProject = await Project.findByIdAndDelete(req.params.projectId);
    // The resource could not be found?
    if (!deletedProject) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
