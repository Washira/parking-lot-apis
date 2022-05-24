const fs = require('fs');
const path = require('path');
const multer = require('multer');
const axios = require('axios');

const csvToProducts = require('../modules/csv-to-json');

// const Dot = require('dot-object');
// const dotObject = new Dot('.', false, true, false);
// const cleanEmptyProps = require('../core/clean-empty-props');

const database = require('../database');
const { NotFound, BadRequest, ServerError } = require('../common/errors');

const LIMIT = 500;

const Product = database.model('Product');

exports.postProduct = async (req, res, next) => {
  try {
    // Create new product instance from payload.
    const newProduct = new Product(req.body);
    // Check if it exists
    const exists = await Product.checkExists(newProduct);
    // Return error to prevent duplicate
    if (exists) throw new BadRequest('The resource already exists.');
    // Insert a product document into database.
    const savedProduct = await newProduct.save();
    // Send the saved product to the client.
    res.status(201).json(savedProduct);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count product documents by query string.
    const results = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter, fields, options),
    ]);
    // Send array of product to the client.
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

exports.getProduct = async (req, res, next) => {
  try {
    // Find a product document by product ID.
    const existProduct = await Product.find({ _id: req.params.productId });
    // The resource could not be found?
    if (!existProduct) throw new NotFound('The resource could not be found.');
    // Send the product to the client.
    res.status(200).json(existProduct);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putProduct = async (req, res, next) => {
  try {
    // Find and update product document by product ID.
    const updatedProduct = await Product.findByIdAndUpdate(req.params.productId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedProduct) throw new NotFound('The resource could not be found.');
    // Send the updated product to the client.
    res.status(200).json(updatedProduct);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    // Find and delete product document by product ID.
    const deletedProduct = await Product.findByIdAndDelete(req.params.productId);
    // The resource could not be found?
    if (!deletedProduct) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

const getCustomTmConfigs = async (offset) => {

  // const urlProd = `http://${process.env.DB_HOST}/custom-rama/api/v1/customTMConfigs?limit=${LIMIT}&offset=${offset}`;
  const urlDev = `http://${process.env.DB_HOST}:${process.env.PORT}/custom-rama/api/v1/customTMConfigs?limit=${LIMIT}&offset=${offset}`;

  const config = {
    method: 'get',
    url: (process.env.production ? urlProd : urlDev),
  };

  const physicalType = await axios(config)
    .then((axiosResponse) => axiosResponse.data)
    .catch((error) => {
      console.log('========== CONFIG ==========\n', error.config);
      if (error.response) {
        console.log('========== DATA ==========\n', error.response.data);
        console.log('========== STATUS ==========\n', error.response.status);
        console.log('========== HEADERS ==========\n', error.response.headers);
      } else {
        console.log('========== ERROR MESSAGE ==========\n', error.message);
      }
    });

  return physicalType;
};

const downloadCustomTmConfigs = async () => {

  let allData = [];
  let offset = 0;

  do {
    ({total, page, data} = await getCustomTmConfigs(offset));
    offset += LIMIT;
    allData.push(...data);
  } while (allData.length < total);

  return allData;
};

const getPhysicalType = async () => {
  const allData = await downloadCustomTmConfigs();
  console.log('All Custom TM Config Data', allData.length);

  const physicalTypeData = allData.filter((v) => v.groupName === 'Physical Type');
  console.log('physicalTypeData', physicalTypeData.length);

  return physicalTypeData;
};

const getUsageType = async () => {
  const allData = await downloadCustomTmConfigs();
  console.log('All Custom TM Config Data', allData.length);

  const usageTypeData = allData.filter((v) => v.groupName === 'Usage Type');
  console.log('usageTypeData', usageTypeData.length);

  return usageTypeData;
};

// const printPhysicalTypeAndUsageType = (physicalType, usageType) => {
//   physicalType.forEach((element) => {
//     console.log(element);
//   });
//   usageType.forEach((element) => {
//     console.log(element);
//   });
// };

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
      cb(null, `import-products-${milliseconds}${fileExt}`);
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
    const Ingredient = database.model('Ingredient');
    const ProductIngredient = database.model('ProductIngredient');
    const physicalType = await getPhysicalType();
    const usageType = await getUsageType();
    // printPhysicalTypeAndUsageType(physicalType, usageType);
    console.log('=========================================================================');

    let prodGroup_not_found_count = 0;
    let prodGroup_found_count = 0;
    let prodGroup_missing_count = 0;
    let prodPhysicalType_missing_count = 0;
    let prodUsageType_missing_count = 0;

    // Import ticket list to MongoDB using CSV file
    let products = await csvToProducts.parseAsync(req.file.path);
    products = products.map(async (prod) => {

      let findCriteria = {};

      // Set search criteria in query
      if (prod.group) {
        if (prod.group.lookup_id && prod.group.lookup_id.trim())          findCriteria['group.lookup_id']      = prod.group.lookup_id.trim();
        if (prod.group.category_id && prod.group.category_id.trim())      findCriteria['group.category_id']    = prod.group.category_id.trim();
        if (prod.group.family_id && prod.group.family_id.trim())          findCriteria['group.family_id']      = prod.group.family_id.trim();
        if (prod.group.chemical_id && prod.group.chemical_id.trim())      findCriteria['group.chemical_id']    = prod.group.chemical_id.trim();
        if (prod.group.category_name && prod.group.category_name.trim())  findCriteria['group.category_name']  = prod.group.category_name.trim();
        if (prod.group.family_name && prod.group.family_name.trim())      findCriteria['group.family_name']    = prod.group.family_name.trim();
        if (prod.group.chemical_name && prod.group.chemical_name.trim())  findCriteria['group.chemical_name']  = prod.group.chemical_name.trim();
        // Take 1st Group from Array for use with Ingredient
        const [prod_group] = await ProductGroup.find(findCriteria);
        // if (! prod_group) {
        //   console.log(prod_group);
        //   console.log('searched using...');
        //   console.log(findCriteria);
        // }
        // Update products for get Object for ProductGroup (or null for no-match)
        prod.group = (prod_group !== undefined ? prod_group : null);
      } else {
        console.log('WARNING: MISSING **PRODUCT GROUP** FOR: old_product_id = ', prod.old_product_id, prod);
        prodGroup_missing_count++;
        prod.group = null;
      }
      // DEBUG no-matches
      if (prod.group === undefined) {
        prodGroup_not_found_count++;
        console.log('findCriteria=', findCriteria);
      } else {
        prodGroup_found_count++;
      }

      // Set search criteria in query for a Product's Ingredient IDs
      findCriteria = { old_product_id: prod.old_product_id };
      // Get all associated Ingredient IDs for a single product
      const prod_ingredients_array = await ProductIngredient.find(findCriteria, { _id: true, old_ingredient_id: true });
      const old_ingredient_id_array = prod_ingredients_array.map((v) => v.old_ingredient_id);
      // Set new search criteria for find Ingredient objects from all IDs
      const new_crtieria = { old_ingredient_id: { $in: old_ingredient_id_array } };
      const ingredients_array = await Ingredient.find(new_crtieria);
      // Update products again for get Objects of ALL associated ingredients (or [] for no-match)
      prod.ingredient = ingredients_array;

      // Update products again for get ObjectID for usage_type (or null for no-match)
      const [physical_type_obj] = physicalType.filter((v) => v.name === prod.physical_type.name);
      if (!physical_type_obj) {
        // console.log('WARNING: MISSING **PHYSICAL TYPE** FOR: old_product_id = ', prod.old_product_id, prod);
        console.log('WARNING: MISSING **PHYSICAL TYPE** FOR: old_product_id = ', prod.old_product_id);
        console.log('physical_type_obj =', physical_type_obj);
        console.log('prod.physical_type.name =', prod.physical_type.name);
        console.log('prod.physical_type.id =', prod.physical_type.id);
        console.log('=========================================================================');
        prodPhysicalType_missing_count++;
      }
      prod.physical_type = (physical_type_obj && physical_type_obj._id !== undefined ? physical_type_obj : null);

      // Update products again for get ObjectID for physical_type (or null for no-match)
      const [usage_type_obj] = usageType.filter((v) => v.name === prod.usage_type.name);
      if (!usage_type_obj) {
        // console.log('WARNING: MISSING **USAGE TYPE** FOR: old_product_id = ', prod.old_product_id, prod);
        console.log('WARNING: MISSING **USAGE TYPE** FOR: old_product_id = ', prod.old_product_id);
        console.log('usage_type_obj =', usage_type_obj);
        console.log('prod.usage_type.name =', prod.usage_type.name);
        console.log('prod.usage_type.id =', prod.usage_type.id);
        console.log('=========================================================================');
        prodUsageType_missing_count++;
      }
      prod.usage_type = (usage_type_obj && usage_type_obj._id !== undefined ? usage_type_obj : null);

      return prod;
    });
    products = await Promise.all(products);

    // DEBUG
    console.log('--- DEBUG ---');
    if (!process.env.production) {
      for (let index = 0; index < 10; index++) {
        const prod = products[index];
        console.log(prod);
      }
    }

    console.log('=========================================================================');

    // Print number of entries with issues
    console.log('Number of entries that have no matching ProductGroup = ', prodGroup_not_found_count);
    console.log('Number of entries that have a matching ProductGroup  = ', prodGroup_found_count);
    console.log('Number of entries that have a missing ProductGroup   = ', prodGroup_missing_count);
    console.log('Number of entries that have a missing PhysicalType   = ', prodPhysicalType_missing_count);
    console.log('Number of entries that have a missing UsageType      = ', prodUsageType_missing_count);

    // Limit 100,000 rows per time (load test target)
    if (products && products.length && products.length > 100000) {
      throw new BadRequest('Limit 100,000 rows per time import.');
    }

    // Chunking insert operation avoid memory leak
    for (let index = 0; index < products.length; index++) {
      const isFull = index % 10000 === 0;
      const isLast = index === products.length - 1;

      // Push each ticket into the current chunk
      chunkDocs.push(products[index]);
      // Insert into MongoDB if chunkDocs get full
      if (isFull === true || isLast === true) {
        /* >>>  InsertMany function does not trigger save middleware. <<<
                ONLY use this when the import data is already perfect
        */
        await Product.insertMany(chunkDocs, options);
        chunkDocs = [];
      }
    }

    // Return import result with affected documents
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      createdDocs: products.length,
    });

  } catch (err) {
    // Pass to error handler
    next(err);
  }
};
