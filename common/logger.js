const colors = require('colors');

/**
 * Print whatever your pass on terminal with yello color.
 *
 * @param {*} data - Any data that want to print out.
 */
const warn = (...args) => {
  console.warn(colors.yellow(...args));
};

/**
 * Print whatever your pass on terminal with green color.
 *
 * @param {*} data - Any data that want to print out.
 */
const info = (...args) => {
  console.info(colors.green(...args));
};

/**
 * Print whatever your pass on terminal with blue color.
 *
 * @param {*} data - Any data that want to print out.
 */
const debug = (...args) => {
  console.debug(colors.blue(...args));
};

/**
 * Print whatever your pass on terminal with red background.
 *
 * @param {*} data - Any data that want to print out.
 */
const error = (...args) => {
  console.error(colors.red(...args));
};

/**
 * Print whatever your pass on terminal as JSON format.
 *
 * @param {*} data - Any data that want to print out.
 */
const json = (data) => {
  console.info(colors.magenta(JSON.stringify(data, null, 2)));
};

module.exports = {
  debug,
  error,
  info,
  warn,
  json,
};
