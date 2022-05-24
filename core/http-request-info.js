const colors = require('colors');
const moment = require('moment');
const utils = require('../common/utils');

/**
 * An http request printer function.
 */
module.exports = (err, req) => {
  let logLevel = console.error;

  // Build a error local-datetime using moment.
  let errorTime = ` ${moment().format('LLLL')} (${moment().format('DD/MM/YYYY HH:mm:ss')}) `;

  // Changing level & color for warning logs.
  if (err && (err.statusCode >= 400 || err.statusCode < 500)) {
    logLevel = console.warn;
    errorTime = colors.bgYellow(errorTime);
    errorTime = colors.black(errorTime);
  } else {
    logLevel = console.error;
    errorTime = colors.bgRed(errorTime);
    errorTime = colors.brightWhite(errorTime);
  }

  // Wed Dec 25 2019 11:15:54 GMT+0700 (Indochina Time).
  logLevel(`\n${errorTime}`);

  // req.originalUrl: /api/v1/rooms
  if (req && req.originalUrl) {
    const label = colors.brightGreen('req.originalUrl: ');
    const value = colors.brightWhite(`${req.method} ${req.originalUrl}`);
    console.group();
    logLevel(`\n${label}${value}`);
    console.groupEnd();
  }

  // req.headers: { host: 'localhost:5000' }
  if (req && req.headers) {
    const label = colors.brightBlue('req.headers: ');
    const value = colors.brightWhite(req.headers);
    console.group();
    logLevel(`\n${label}${value}`);
    console.groupEnd();
  }

  // req.query: { isActive: true }
  if (req && req.query && !utils.isEmptyObject(req.query)) {
    const label = colors.brightMagenta('req.query: ');
    const value = colors.brightWhite(req.query);
    console.group();
    logLevel(`\n${label}${value}`);
    console.groupEnd();
  }

  // req.body: { "foo": "bar" }
  if (req && req.method !== 'GET' && req.body) {
    const label = colors.brightCyan('req.body: ');
    const value = colors.brightWhite(req.body);
    console.group();
    logLevel(`\n${label}${value}`);
    console.groupEnd();
  }

  // Print an empty line.
  logLevel();
};
