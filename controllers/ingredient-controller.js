const fs = require('fs');
const path = require('path');
const multer = require('multer');

const csvToIngredients = require('../modules/csv-to-json');

// const Dot = require('dot-object');
// const dotObject = new Dot('.', false, true, false);
// const cleanEmptyProps = require('../core/clean-empty-props');

const database = require('../database');
const { NotFound, BadRequest, ServerError } = require('../common/errors');

const Ingredient = database.model('Ingredient');

exports.postIngredient = async (req, res, next) => {
  try {
    // Create new ingredient instance from payload.
    const newIngredient = new Ingredient(req.body);
    // Check if it exists
    const exists = await Ingredient.checkExists(newIngredient);
    // Return error to prevent duplicate
    if (exists) throw new BadRequest('The resource already exists.');
    // Insert a ingredient document into database.
    const savedIngredient = await newIngredient.save();
    // Send the saved ingredient to the client.
    res.status(201).json(savedIngredient);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getIngredients = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count ingredient documents by query string.
    const results = await Promise.all([
      Ingredient.countDocuments(filter),
      Ingredient.find(filter, fields, options),
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

exports.getIngredient = async (req, res, next) => {
  try {
    // Find a ingredient document by ingredient ID.
    const existIngredient = await Ingredient.find({ _id: req.params.ingredientId });
    // The resource could not be found?
    if (!existIngredient) throw new NotFound('The resource could not be found.');
    // Send the ingredient to the client.
    res.status(200).json(existIngredient[0]);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putIngredient = async (req, res, next) => {
  try {
    // Find and update ingredient document by ingredient ID.
    const updatedIngredient = await Ingredient.findByIdAndUpdate(req.params.ingredientId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedIngredient) throw new NotFound('The resource could not be found.');
    // Send the updated ingredient to the client.
    res.status(200).json(updatedIngredient);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteIngredient = async (req, res, next) => {
  try {
    // Find and delete ingredient document by ingredient ID.
    const deletedIngredient = await Ingredient.findByIdAndDelete(req.params.ingredientId);
    // The resource could not be found?
    if (!deletedIngredient) throw new NotFound('The resource could not be found.');
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
      cb(null, `import-ingredients-${milliseconds}${fileExt}`);
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
    let ingredients = await csvToIngredients.parseAsync(req.file.path);
    ingredients = ingredients.map(async (ing) => {
      let prod_group;
      const findCriteria = {};
      // Set search criteria in query
      if (ing.group) {
        if (ing.group.lookup_id)      findCriteria['group.lookup_id']      = ing.group.lookup_id;
        if (ing.group.category_id)    findCriteria['group.category_id']    = ing.group.category_id;
        if (ing.group.family_id)      findCriteria['group.family_id']      = ing.group.family_id;
        if (ing.group.chemical_id)    findCriteria['group.chemical_id']    = ing.group.chemical_id;
        if (ing.group.category_name)  findCriteria['group.category_name']  = ing.group.category_name;
        if (ing.group.family_name)    findCriteria['group.family_name']    = ing.group.family_name;
        if (ing.group.chemical_name)  findCriteria['group.chemical_name']  = ing.group.chemical_name;
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
      // Update Json object with Product Group (or null for no-match)
      ing.group = (prod_group !== undefined ? prod_group : null);
      return ing;
    });
    ingredients = await Promise.all(ingredients);

    // Print number of entries with issues
    console.log('Number of entries that have no matching ProductGroup = ', not_found_count);
    console.log('Number of entries that have a matching ProductGroup  = ', found_count);

    // Limit 100,000 rows per time (load test target)
    if (ingredients && ingredients.length && ingredients.length > 100000) {
      throw new BadRequest('Limit 100,000 rows per time import.');
    }

    // Chunking insert operation avoid memory leak
    for (let index = 0; index < ingredients.length; index++) {
      const isFull = index % 10000 === 0;
      const isLast = index === ingredients.length - 1;

      // Push each ticket into the current chunk
      chunkDocs.push(ingredients[index]);
      // Insert into MongoDB if chunkDocs get full
      if (isFull === true || isLast === true) {
        /* >>>  InsertMany function does not trigger save middleware. <<<
                ONLY use this when the import data is already perfect
        */
        await Ingredient.insertMany(chunkDocs, options);
        chunkDocs = [];
      }
    }

    // Return import result with affected documents
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      createdDocs: ingredients.length,
    });

  } catch (err) {
    // Pass to error handler
    next(err);
  }
};
