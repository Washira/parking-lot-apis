const BadRequest = require('./classes/BadRequest');
const Unauthorized = require('./classes/Unauthorized');
const Forbidden = require('./classes/Forbidden');
const NotFound = require('./classes/NotFound');
const Conflict = require('./classes/Conflict');
const ServerError = require('./classes/ServerError');

module.exports = {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  Conflict,
  ServerError,
};
