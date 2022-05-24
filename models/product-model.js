// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {

  // Sets model & collection name here.
  const modelName = 'Product';
  const collectionName = 'products';

  const DEBUG = process.env.production;

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    old_product_id: { type: String, require: false }, // Only needed during import
    name: { type: String, required: false },
    code: { type: String, required: false },
    isActive: { type: Boolean, required: false, default: true },
    trade_name_th: { type: String, required: false },
    generic_name_en: { type: String, required: false },
    generic_name_th: { type: String, required: false },
    group: mongoose.model('ProductGroup').schema,
    ingredient: [mongoose.model('Ingredient').schema],
    physical_type: mongoose.model('CustomTMConfig').schema,
    usage_type: mongoose.model('CustomTMConfig').schema,
    created_by: { type: String, required: false },
    updated_by: { type: String, required: false },
    created_by_name: { type: String, required: false },
    updated_by_name: { type: String, required: false },
    // price: { type: Date, required: false },
  }, {
    id: false,
    strict: true,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  });

  // A static method to detect if similar entry exists.
  schema.statics.checkExists = async function (item) {
    // Not enough data
    if (!item.name && !item.trade_name_th) {
      console.log('WARNING: No "name" and no "trade_name_th", cannot check if entry already exists!');
      return false;
    }
    // Create Query
    const query = {};
    if (item.name) query.name = item.name;
    if (item.trade_name_th) query.trade_name_th = item.trade_name_th;
    // Perform search
    const exists = await this.findOne(query)
      .then((doc) => {
        return (doc !== null);
      })
      .catch((err) => {
        console.log('ERROR during checkExists.findOne(): ', err);
      });

    return exists;
  };

  // On SAVE: Update Product data with up-to-date Docs from other collections
  // Collections: ProductGroup, Ingredient, CustomTMConfig (physical_type, usage_type)
  schema.pre('save', async function (next) {
    // Find Group for Product
    const group = await mongoose.model('ProductGroup').findOne({ _id: this.group._id });
    if (DEBUG) console.log('group: ', group);
    // Find Ingredients for Product from Array
    const ingredient_array = await Promise.all(
      this.ingredient.map((v) => {
        return mongoose.model('Ingredient').findOne({ _id: v._id });
      })
    );
    if (DEBUG) console.log('ingredient: ', ingredient_array);
    // Find Physical Type for Product
    const physical_type = await mongoose.model('CustomTMConfig').findOne({ _id: this.physical_type._id });
    if (DEBUG) console.log('physical_type: ', physical_type);
    // Find Usage Type for Product
    const usage_type = await mongoose.model('CustomTMConfig').findOne({ _id: this.usage_type._id });
    if (DEBUG) console.log('usage_type: ', usage_type);
    // Update into Product data before insert
    this.group = group;
    this.ingredient = ingredient_array;
    this.physical_type = physical_type;
    this.usage_type = usage_type;
    next();
  });

  // Define a model or retrieves it.
  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });

  mongoose.model(modelName, schema, collectionName);
};
