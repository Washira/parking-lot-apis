const fs = require('fs');
const path = require('path');
const multer = require('multer');

const csvToGroups = require('../modules/csv-to-json');

// const Dot = require('dot-object');
// const dotObject = new Dot('.', false, true, false);
// const cleanEmptyProps = require('../core/clean-empty-props');

const database = require('../database');
const { NotFound, BadRequest, ServerError } = require('../common/errors');

const ProductGroup = database.model('ProductGroup');

exports.postProductGroup = async (req, res, next) => {
  try {
    // Create new productGroup instance from payload.
    const newProductGroup = new ProductGroup(req.body);
    // Check if it exists
    const exists = await ProductGroup.checkExists(newProductGroup);
    // Return error to prevent duplicate
    if (exists) throw new BadRequest('The resource already exists.');
    // Insert a productGroup document into database.
    const savedProductGroup = await newProductGroup.save();
    // Send the saved productGroup to the client.
    res.status(201).json(savedProductGroup);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getProductGroups = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count productGroup documents by query string.
    const results = await Promise.all([
      ProductGroup.countDocuments(filter),
      ProductGroup.find(filter, fields, options),
    ]);
    // Send array of productGroup to the client.
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

exports.getProductGroup = async (req, res, next) => {
  try {
    // Find a productGroup document by productGroup ID.
    const existProductGroup = await ProductGroup.findById(req.params.productGroupId);
    // The resource could not be found?
    if (!existProductGroup) throw new NotFound('The resource could not be found.');
    // Send the productGroup to the client.
    res.status(200).json(existProductGroup);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putProductGroup = async (req, res, next) => {
  try {
    // Find and update productGroup document by productGroup ID.
    const updatedProductGroup = await ProductGroup.findByIdAndUpdate(req.params.productGroupId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedProductGroup) throw new NotFound('The resource could not be found.');
    // Send the updated productGroup to the client.
    res.status(200).json(updatedProductGroup);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteProductGroup = async (req, res, next) => {
  try {
    // Find and delete productGroup document by productGroup ID.
    const deletedProductGroup = await ProductGroup.findByIdAndDelete(req.params.productGroupId);
    // The resource could not be found?
    if (!deletedProductGroup) throw new NotFound('The resource could not be found.');
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
    const groups = await csvToGroups.parseAsync(req.file.path);

    // Limit 100,000 rows per time (load test target)
    if (groups && groups.length && groups.length > 100000) {
      throw new BadRequest('Limit 100,000 rows per time import.');
    }

    // Chunking insert operation avoid memory leak
    for (let index = 0; index < groups.length; index++) {
      const isFull = index % 10000 === 0;
      const isLast = index === groups.length - 1;

      // Push each ticket into the current chunk
      chunkDocs.push(groups[index]);
      // Insert into MongoDB if chunkDocs get full
      if (isFull === true || isLast === true) {
        /* >>>  InsertMany function does not trigger save middleware. <<<
                ONLY use this when the import data is already perfect
        */
        await ProductGroup.insertMany(chunkDocs, options);
        chunkDocs = [];
      }
    }

    // Return import result with affected documents
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      createdDocs: groups.length,
    });

  } catch (err) {
    // Pass to error handler
    next(err);
  }
};
