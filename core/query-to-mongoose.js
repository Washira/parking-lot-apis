/* eslint-disable */
const querystring = require('querystring');

const ISO8601 = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?(T([01][0-9]|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;

function fieldsToMongo(fields) {
  if (!fields) return null
  var hash = {}
  fields.split(',').forEach(function (field) {
    hash[field.trim()] = 1
  })
  return hash
}

function omitFieldsToMongo(omitFields) {
  if (!omitFields) return null
  var hash = {}
  omitFields.split(',').forEach(function (omitField) {
    hash[omitField.trim()] = 0
  })
  return hash
}

function sortToMongo(sort) {
  if (!sort) return null
  var hash = {}, c
  sort.split(',').forEach(function (field) {
    c = field.charAt(0)
    if (c == '-') field = field.substr(1)
    hash[field.trim()] = (c == '-') ? -1 : 1
  })
  return hash
}

function typedValue(value) {
  if (value[0] == '!') value = value.substr(1)
  var regex = value.match(/^\/(.*)\/(i?)$/);
  var quotedString = value.match(/(["'])(?:\\\1|.)*?\1/);

  if (regex) {
    return new RegExp(regex[1], regex[2]);
  } else if (quotedString) {
    return quotedString[0].substr(1, quotedString[0].length - 2);
  } else if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else if (ISO8601.test(value) && value.length !== 4) {
    return new Date(value);
  } else if (!isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

function typedValues(svalue) {
  var commaSplit = /("[^"]*")|('[^']*')|(\/[^\/]*\/i?)|([^,]+)/g
  var values = []
  svalue
    .match(commaSplit)
    .forEach(function (value) {
      values.push(typedValue(value))
    })
  return values;
}

function comparisonToMongo(key, value) {
  var join = (value == '') ? key : key.concat('=', value)
  var parts = join.match(/^(!?[^><!=:]+)(?:=?([><]=?|!?=|:.+=)(.+))?$/)
  var op, hash = {}
  if (!parts) return null
  key = parts[1]
  op = parts[2]

  if (!op) {
    if (key[0] != '!') value = { '$exists': true }
    else {
      key = key.substr(1)
      value = { '$exists': false }
    }
  } else if (op == '=' && parts[3] == '!') {
    value = { '$exists': false }
  } else if (op == '=' || op == '!=') {
    if (op == '=' && parts[3][0] == '!') op = '!='
    var array = typedValues(parts[3]);
    if (array.length > 1) {
      value = {}
      op = (op == '=') ? '$in' : '$nin'
      value[op] = array
    } else if (op == '!=') {
      value = array[0] instanceof RegExp ?
        { '$not': array[0] } :
        { '$ne': array[0] }
    } else if (array[0][0] == '!') {
      var sValue = array[0].substr(1)
      var regex = sValue.match(/^\/(.*)\/(i?)$/)
      value = regex ?
        { '$not': new RegExp(regex[1], regex[2]) } :
        { '$ne': sValue }
    } else {
      value = array[0]
    }
  } else if (op[0] == ':' && op[op.length - 1] == '=') {
    op = '$' + op.substr(1, op.length - 2)
    var array = []
    parts[3].split(',').forEach(function (value) {
      array.push(typedValue(value))
    })
    value = {}
    value[op] = array.length == 1 ? array[0] : array
  } else {
    value = typedValue(parts[3])
    if (op == '>') value = { '$gt': value }
    else if (op == '>=') value = { '$gte': value }
    else if (op == '<') value = { '$lt': value }
    else if (op == '<=') value = { '$lte': value }
  }
  hash.key = key
  hash.value = value
  return hash
}

function hasOrdinalKeys(obj) {
  var c = 0
  for (var key in obj) {
    if (Number(key) !== c++) return false
  }
  return true
}

function queryCriteriaToMongo(query, options) {
  var hash = {}, p, v, deep
  options = options || {}

  for (var key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key) && (!options.ignore || options.ignore.indexOf(key) == -1)) {
      deep = (typeof query[key] === 'object' && !hasOrdinalKeys(query[key]))
      if (deep) {
        p = {
          key: key,
          value: queryCriteriaToMongo(query[key])
        }
      } else {
        p = comparisonToMongo(key, query[key])
      }

      if (p) {
        if (!hash[p.key]) {
          hash[p.key] = p.value;
        } else {
          hash[p.key] = Object.assign(hash[p.key], p.value);
        }
      }
    }
  }
  return hash
}

function queryOptionsToMongo(query, options) {
  var hash = {},
    fields = fieldsToMongo(query[options.keywords.fields]),
    omitFields = omitFieldsToMongo(query[options.keywords.omit]),
    sort = sortToMongo(query[options.keywords.sort]),
    maxLimit = options.maxLimit || 9007199254740992,
    limit = options.maxLimit || 0

  if (fields) hash.fields = fields
  if (omitFields) hash.fields = omitFields
  if (sort) hash.sort = sort
  if (query[options.keywords.offset]) hash.skip = Number(query[options.keywords.offset])
  if (query[options.keywords.limit]) limit = Math.min(Number(query[options.keywords.limit]), maxLimit)
  if (limit) {
    hash.limit = limit
  } else if (options.maxLimit) {
    hash.limit = maxLimit
  }
  return hash
}

/**
 * The original initial function without express middleware.
 */
function parse(query, options) {
  query = query || {};
  options = options || {}
  options.keywords = options.keywords || {}

  defaultKeywords = { fields: 'fields', omit: 'omit', sort: 'sort', offset: 'offset', limit: 'limit' }
  options.keywords = Object.assign(defaultKeywords, options.keywords)
  ignoreKeywords = [options.keywords.fields, options.keywords.omit, options.keywords.sort, options.keywords.offset, options.keywords.limit]

  if (!options.ignore) {
    options.ignore = []
  } else {
    options.ignore = (typeof options.ignore === 'string') ? [options.ignore] : options.ignore
  }
  options.ignore = options.ignore.concat(ignoreKeywords)
  if (!options.parser) options.parser = querystring

  if (typeof query === 'string') query = options.parser.parse(query)

  return {
    criteria: queryCriteriaToMongo(query, options),
    options: queryOptionsToMongo(query, options),
  }
}

/**
 * A middleware that will parse URL query string to mongoose
 * about filter, projection, options and attach to the request.
 */
module.exports = (req, res, next) => {
  
  try {
    // Convert query string to (mongodb) query.
    const options = { maxLimit: req.query.limit || 500 };
    const query = parse(req.query, options);

    // Attachs query to express.req (mongoose).
    req.filter = query.criteria || {};
    req.fields = query.options.fields || {};
    req.options = query.options || {};

    // Deletes duplicate fields in options.
    delete req.options.fields;
    next();

  } catch (err) {

    // Pass to error handler.
    return next(err);
  }
};
