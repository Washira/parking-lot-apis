const PrettyError = require('pretty-error');

/**
 * Create prettyError instance for error.
 */
const pError = new PrettyError();
pError.skipPackage('express');
pError.appendStyle({
  'pretty-error > header > title > kind': {
    background: 'none',
    color: 'bright-red',
  },
  'pretty-error > header > colon': {
    color: 'bright-red',
  },
  'pretty-error > trace': {
    marginTop: 0,
    marginLeft: 2,
  },
  'pretty-error > trace > item': {
    marginTop: 1,
    marginBottom: 0,
  },
});

/**
 * Create prettyError instance for warning.
 */
const pWarning = new PrettyError();
pWarning.skipPackage('express');
pWarning.appendStyle({
  'pretty-error > header > title > kind': {
    background: 'none',
    color: 'bright-yellow',
  },
  'pretty-error > header > colon': {
    color: 'bright-yellow',
  },
  'pretty-error > trace': {
    marginTop: 0,
    marginLeft: 2,
  },
  'pretty-error > trace > item': {
    marginTop: 1,
    marginBottom: 0,
  },
  'pretty-error > trace > item > header > pointer > file': {
    color: 'white',
  },
  'pretty-error > trace > item > header > pointer > line': {
    color: 'white',
  },
});

/**
 * An error object printer function.
 */
module.exports = (err, req, res, next) => {
  if (err && (err.statusCode >= 400 || err.statusCode < 500)) {
    console.warn(pWarning.render(err));
  } else if (err) {
    console.error(pError.render(err));
  }
};
