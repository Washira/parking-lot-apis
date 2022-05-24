const httpRequestInfo = require('./http-request-info');
const lessClutterError = require('./less-clutter-error');

/**
 * An error handling middleware that should be executes,
 * When the server responses HTTP Status between 400 and 500.
 */
module.exports = (err, req, res, next) => {
  // To support mongoose async validation (await save).
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.message = Object.values(err.errors)[0].message;
  }

  // Defaults undefined error properties.
  const status = err.status || 'error';
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An error occurred during processing your request.';

  // Print request info when an error occurs.
  httpRequestInfo(err, req);
  // Pretty printing standard js errors.
  lessClutterError(err);
  // Send json error to the client
  res.status(statusCode).json({
    status, statusCode, message,
  });
};
