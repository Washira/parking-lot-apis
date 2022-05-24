const fs = require('fs');
const path = require('path');
const multer = require('multer');

const csvToProductIngredients = require('../modules/csv-to-json');

// const Dot = require('dot-object');
// const dotObject = new Dot('.', false, true, false);
// const cleanEmptyProps = require('../core/clean-empty-props');

const database = require('../database');
const { NotFound, BadRequest, ServerError } = require('../common/errors');

const ProductIngredient = database.model('ProductIngredient');

exports.postProductIngredient = async (req, res, next) => {
  try {
    // Create new ingredient instance from payload.
    const newProductIngredient = new ProductIngredient(req.body);
    // Check if it exists
    const exists = await ProductIngredient.checkExists(newProductIngredient);
    // Return error to prevent duplicate
    if (exists) throw new BadRequest('The resource already exists.');
    // Insert a ingredient document into database.
    const savedProductIngredient = await newProductIngredient.save();
    // Send the saved ingredient to the client.
    res.status(201).json(savedProductIngredient);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getProductIngredients = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count ingredient documents by query string.
    const results = await Promise.all([
      ProductIngredient.countDocuments(filter),
      ProductIngredient.find(filter, fields, options),
    ]);
    // Send array of ingredient to the client.
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

exports.getProductIngredient = async (req, res, next) => {
  try {
    // Find a ingredient document by ingredient ID.
    const existProductIngredient = await ProductIngredient.find({ _id: req.params.productIngredientId });
    // The resource could not be found?
    if (!existProductIngredient) throw new NotFound('The resource could not be found.');
    // Send the ingredient to the client.
    res.status(200).json(existProductIngredient[0]);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putProductIngredient = async (req, res, next) => {
  try {
    // Find and update ingredient document by ingredient ID.
    const updatedProductIngredient = await ProductIngredient.findByIdAndUpdate(req.params.productIngredientId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedProductIngredient) throw new NotFound('The resource could not be found.');
    // Send the updated ingredient to the client.
    res.status(200).json(updatedProductIngredient);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteProductIngredient = async (req, res, next) => {
  try {
    // Find and delete ingredient document by ingredient ID.
    const deletedProductIngredient = await ProductIngredient.findByIdAndDelete(req.params.productIngredientId);
    // The resource could not be found?
    if (!deletedProductIngredient) throw new NotFound('The resource could not be found.');
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
      cb(null, `import-product-ingredients-${milliseconds}${fileExt}`);
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

    const ProductGroup = database.model('ProductGroup');
    let not_found_count = 0;
    let found_count = 0;

    // Import ticket list to MongoDB using CSV file
    const productIngredients = await csvToProductIngredients.parseAsync(req.file.path);
    // DEBUG: Check for any missing Product Groups
    const check = productIngredients.map(async (prodIng) => {
      let prod_group;
      const findCriteria = {};
      // Set search criteria in query
      if (prodIng) {
        if (prodIng.lookup_id) findCriteria['group.lookup_id'] = prodIng.lookup_id;
        if (prodIng.category_id) findCriteria['group.category_id'] = prodIng.category_id;
        if (prodIng.family_id) findCriteria['group.family_id'] = prodIng.family_id;
        if (prodIng.chemical_id) findCriteria['group.chemical_id'] = prodIng.chemical_id;
        if (prodIng.category_name) findCriteria['group.category_name'] = prodIng.category_name;
        if (prodIng.family_name) findCriteria['group.family_name'] = prodIng.family_name;
        if (prodIng.chemical_name) findCriteria['group.chemical_name'] = prodIng.chemical_name;
        // Take 1st Group from Array for use with Ingredient
        [prod_group] = await ProductGroup.find(findCriteria);
      }
      // DEBUG no-matches
      if (prod_group === undefined) {
        not_found_count++;
        console.log('findCriteria=', findCriteria);
      } else {
        found_count++;
      }
      return prodIng;
    });
    // Only checking, no need to overwrite value
    await Promise.all(check);

    console.log(productIngredients[0]);

    // Print number of entries with issues
    console.log('Number of entries that have no matching ProductGroup = ', not_found_count);
    console.log('Number of entries that have a matching ProductGroup  = ', found_count);

    // Limit 100,000 rows per time (load test target)
    if (productIngredients && productIngredients.length && productIngredients.length > 100000) {
      throw new BadRequest('Limit 100,000 rows per time import.');
    }

    // Chunking insert operation avoid memory leak
    for (let index = 0; index < productIngredients.length; index++) {
      const isFull = index % 10000 === 0;
      const isLast = index === productIngredients.length - 1;

      // Push each ticket into the current chunk
      chunkDocs.push(productIngredients[index]);
      // Insert into MongoDB if chunkDocs get full
      if (isFull === true || isLast === true) {
        /* >>>  InsertMany function does not trigger save middleware. <<<
                ONLY use this when the import data is already perfect
        */
        await ProductIngredient.insertMany(chunkDocs, options);
        chunkDocs = [];
      }
    }

    // Return import result with affected documents
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      createdDocs: productIngredients.length,
    });

  } catch (err) {
    // Pass to error handler
    next(err);
  }
};
