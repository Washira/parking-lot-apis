const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const passport = require('passport');
const errorHandler = require('./core/error-handler');
const todayStatsSchedule = require('./modules/today-stats-schedule');

/**
 * An express web application instance.
 */
const app = express();
app.disable('x-powered-by');
// app.use(cors());

/**
 * Connect to the mongodb server using mongoose.
 */
require('./database');

/**
 * Initial some scheduled processes.
 */
todayStatsSchedule.init();

/**
 * Print morgan concise logs each http requests.
 * WARN: Don't forget implement pm2-logrotate.
 */
app.use(morgan('dev'));

/**
 * Compress respone bodies each http requests.
 * that traverse through the middleware on production.
 */
if (process.env.NODE_ENV === 'production') {
  app.use(compression());
}

/**
 * Parse incoming http requests with JSON payloads.
 * application/json
 */
app.use(express.json({ limit: '100kb' }));

/**
 * Parse incoming requests with form urlencoded payloads.
 * application/x-www-form-urlencoded
 */
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

/**
 * Adds more passport strategy here.
 */
app.use(passport.initialize());

/**
 * Adds more express router here.
 */
app.use(require('./routes/product-group-router'));
app.use(require('./routes/ingredient-router'));
app.use(require('./routes/product-ingredient-router'));
app.use(require('./routes/product-router'));
app.use(require('./routes/followup-router'));
app.use(require('./routes/hospital-router'));
app.use(require('./routes/formula-router'));
app.use(require('./routes/custom-tm-config-router'));
app.use(require('./routes/province-router'));
app.use(require('./routes/script-router'));
app.use(require('./routes/company-router'));

/**
 * Didn't match any server-side routers.
 */
app.get('/*', (req, res, next) => {
  // Send 404 page not found without error.
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'The path could not be found.',
  });
});

/**
 * Setup centralized error handling.
 */
app.use(errorHandler);

/**
 * The configured express instance.
 */
module.exports = app;
