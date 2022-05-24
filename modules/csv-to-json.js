/* eslint-disable dot-notation */
/* eslint-disable eqeqeq */
const fs = require('fs');
const csv = require('csv');
const dotObject = require('dot-object');
const logger = require('../common/logger');

// Delete null and empty string properties
const deleteNonValueProps = (object) => {
  return Object.fromEntries(
    Object.entries(object)
      .filter(([_, v]) => (v != null && v !== ''))
      .map(([k, v]) => [k, v === Object(v) ? deleteNonValueProps(v) : v]),
  );
};

// In-memory collections represent MongoDB
let collections = {};

// Find any collection any document in memory
const findRelatedDoc = (colName, key, value) => {
  // Prevent TypeError: Cannot read property 'find' of undefined
  if (!Array.isArray(collections[colName])) return undefined;
  return collections[colName].find((i) => i[key] == value);
};

// Infer the columns names from the first line
const parser = csv.parse({ columns: true });

// Transform rowObject to Json during stream here
const transformer = csv.transform((rowObject, cb) => {
  rowObject = deleteNonValueProps(rowObject);
  rowObject = dotObject.object(rowObject);
  cb(null, rowObject);
});

/**
 * Release in-memory collections
 */
const deinitialize = () => {
  collections = {};
};

/**
 * Fetch all dependencies save in-memory collections
 */
const initialize = async () => {
  deinitialize();
};

/**
 * Convert CSV file to array of objects (chunks)
 * - Reads stream file contents (CSV)
 * - Parse CSV to Object using csv-parser
 * - Keep into complete jsonFromCsv list
 * - Release in-memory collections
 *
 * @param {string} csvPath - Relative CSV path
 * @return Return an array of objects
 */
const readCsvConvertToArrayOfJson = async (csvPath) => {
  await initialize();

  return new Promise((resolve, reject) => {
    let jsonFromCsv = [];

    fs.createReadStream(csvPath)
      .pipe(parser)
      .pipe(transformer)
      .on('data', (category) => {
        jsonFromCsv.push(category);
      })
      .on('end', () => {
        deinitialize();
        resolve(jsonFromCsv);
      })
      .on('error', (err) => {
        deinitialize();
        reject(err);
      });
  });
};

module.exports = {
  parseAsync: readCsvConvertToArrayOfJson,
};
