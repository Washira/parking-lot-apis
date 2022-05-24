const fs = require('fs');
const path = require('path');
const multer = require('multer');

const csvToGroups = require('../modules/csv-to-json');

// const Dot = require('dot-object');
// const dotObject = new Dot('.', false, true, false);
// const cleanEmptyProps = require('../core/clean-empty-props');

const database = require('../database');
const { NotFound, BadRequest, ServerError } = require('../common/errors');

const CustomTMConfig = database.model('CustomTMConfig');

exports.postCustomTMConfig = async (req, res, next) => {
  try {
    // Create new CustomTMConfig instance from payload.
    const newCustomTMConfig = new CustomTMConfig(req.body);
    // Insert a CustomTMConfig document into database.
    const savedCustomTMConfig = await newCustomTMConfig.save();
    // Send the saved CustomTMConfig to the client.
    res.status(201).json(savedCustomTMConfig);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getCustomTMConfigs = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count CustomTMConfig documents by query string.
    const results = await Promise.all([
      CustomTMConfig.countDocuments(filter),
      CustomTMConfig.find(filter, fields, options),
    ]);
    // Send array of CustomTMConfig to the client.
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

exports.getCustomTMConfig = async (req, res, next) => {
  try {
    // Find a CustomTMConfig document by CustomTMConfig ID.
    const existCustomTMConfig = await CustomTMConfig.findById(req.params.customTMConfigId);
    // The resource could not be found?
    if (!existCustomTMConfig) throw new NotFound('The resource could not be found.');
    // Send the CustomTMConfig to the client.
    res.status(200).json(existCustomTMConfig);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putCustomTMConfig = async (req, res, next) => {
  try {
    // Find and update CustomTMConfig document by CustomTMConfig ID.
    const updatedCustomTMConfig = await CustomTMConfig.findByIdAndUpdate(req.params.customTMConfigId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedCustomTMConfig) throw new NotFound('The resource could not be found.');
    // Send the updated CustomTMConfig to the client.
    res.status(200).json(updatedCustomTMConfig);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteCustomTMConfig = async (req, res, next) => {
  try {
    // Find and delete CustomTMConfig document by CustomTMConfig ID.
    const deletedCustomTMConfig = await CustomTMConfig.findByIdAndDelete(req.params.customTMConfigId);
    // The resource could not be found?
    if (!deletedCustomTMConfig) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

// Initialize multer for upload CSV file
exports.multerImportCsv = multer({
  // StorageEngine gives you full control files
  storage: multer.diskStorage({
    // The destination path for uploaded files
    destination: (req, file, cb) => {
      // cb(null, 'tmp');
      cb(null, 'import');
    },
    // This might not be unique if too many admin
    filename: (req, file, cb) => {
      const milliseconds = Date.now();
      const fileExt = path.extname(file.originalname);
      // const fileName = file.originalname;
      cb(null, `import-product-groups-${milliseconds}${fileExt}`);
    },
  }),
  // Function to control which files are uploaded
  fileFilter: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    if (fileExt !== '.csv') {
      const msg = 'File type must be csv.';
      return cb(new BadRequest(msg));
    }
    cb(null, true);
  },
  // Specifying various limits on incoming data
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
});

// NOTE: Calling multer in front will attach req.file
exports.postImportCsv = async (req, res, next) => {
  let chunkDocs = [];

  // Raw result from MongoDB Driver without mongoose
  const options = { rawResult: true };

  try {
    // There have calling multer MW before this?
    if (!req.file) throw new ServerError('This method require req.file');

    // const fileName = req.file.originalname;

    // Is Multer has finished writing the file?
    const isExist = fs.existsSync(req.file.path);
    if (!isExist) throw new ServerError(`File ${req.file.path} not found.`);

    // Import ticket list to MongoDB using CSV file
    const customTMConfigs = await csvToGroups.parseAsync(req.file.path);

    // Limit 100,000 rows per time (load test target)
    if (customTMConfigs && customTMConfigs.length && customTMConfigs.length > 100000) {
      throw new BadRequest('Limit 100,000 rows per time import.');
    }

    // Chunking insert operation avoid memory leak
    for (let index = 0; index < customTMConfigs.length; index++) {
      const isFull = index % 10000 === 0;
      const isLast = index === customTMConfigs.length - 1;

      // Push each ticket into the current chunk
      chunkDocs.push(customTMConfigs[index]);
      // Insert into MongoDB if chunkDocs get full
      if (isFull === true || isLast === true) {
        /* >>>  InsertMany function does not trigger save middleware. <<<
                ONLY use this when the import data is already perfect
        */
        await CustomTMConfig.insertMany(chunkDocs, options);
        chunkDocs = [];
      }
    }

    // Return import result with affected documents
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      createdDocs: customTMConfigs.length,
    });

  } catch (err) {
    // Pass to error handler
    next(err);
  }
};
