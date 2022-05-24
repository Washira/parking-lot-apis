const { isEmpty, isPlainObject, transform } = require('lodash');

/**
 * A Function for cleansing javascript object that will
 * Removes empty-string, null, undefined, string-undefined
 * by calling single-line and also support nesting property.
 */
module.exports = function cleanEmptyProps(object, options = {}) {
  const {
    cleanKeys = [],
    cleanValues = [],
    emptyArrays = true,
    emptyObjects = true,
    emptyStrings = false,
    nullValues = true,
    undefinedValues = true,
  } = options;

  // Transforms object to a new accumulator object.
  return transform(object, (result, value, key) => {

    // Exclude specific keys.
    if (cleanKeys.includes(key)) {
      return;
    }

    // Recurse into arrays and objects.
    if (Array.isArray(value) || isPlainObject(value)) {
      value = cleanEmptyProps(value, {
        cleanKeys,
        cleanValues,
        emptyArrays,
        emptyObjects,
        emptyStrings,
        nullValues,
        undefinedValues,
      });
    }

    // Exclude specific values.
    if (cleanValues.includes(value)) {
      return;
    }

    // Exclude empty objects.
    if (emptyObjects && isPlainObject(value) && isEmpty(value)) {
      return;
    }

    // Exclude empty arrays.
    if (emptyArrays && Array.isArray(value) && !value.length) {
      return;
    }

    // Exclude empty strings.
    if (emptyStrings && value === '') {
      return;
    }

    // Exclude null values.
    if (nullValues && value === null) {
      return;
    }

    // Exclude undefined values.
    if (undefinedValues && (value === undefined || value === 'undefined')) {
      return;
    }

    // Append when recursing arrays.
    if (Array.isArray(result)) {
      return result.push(value);
    }

    result[key] = value;
  });
};
