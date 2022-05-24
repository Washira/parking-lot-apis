// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {

  // Sets model & collection name here.
  const modelName = 'Ingredient';
  const collectionName = 'ingredients';

  const DEBUG = process.env.production;

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    old_ingredient_id: { type: String, require: false }, // Only needed during import
    name: { type: String, required: false, default: '' },
    isActive: { type: Boolean, required: true, default: true },
    group: mongoose.model('ProductGroup').schema,
    advice_info: { type: String, required: false },
    advice_info_date: { type: Date, required: false },
    created_by: { type: String, required: false },
    updated_by: { type: String, required: false },
    created_by_name: { type: String, required: false },
    updated_by_name: { type: String, required: false },
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
    if (!item.name) {
      console.log('WARNING: No "name", cannot check if entry already exists!');
      return false;
    }
    // Create Query
    const query = {};
    if (item.name) query.name = item.name;
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

  // On SAVE: Update Ingredient date with up-to-date Docs from other collections
  // Collections: ProductGroup
  schema.pre('save', async function (next) {
    // Skip processing the save, in pre-save hook
    if (!this.model) {
      if (DEBUG) console.log('[INGREDIENT pre-save] Model is UnDefined!!', this.model);
      return;
    }
    // Find Group for Ingredient
    const group = await mongoose.model('ProductGroup').findOne({ _id: this.group._id });
    if (DEBUG) console.log('group: ', group);
    this.group = group;
    next();
  });

  // Define a model or retrieves it.
  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });

  mongoose.model(modelName, schema, collectionName);
};
