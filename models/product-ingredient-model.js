// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {

  // Sets model & collection name here.
  const modelName = 'ProductIngredient';
  const collectionName = 'product_ingredients';

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    old_product_id: { type: String, require: false }, // Only needed during import
    old_ingredient_id: { type: String, require: false }, // Only needed during import
    lookup_id: { type: String, require: false },
    category_id: { type: String, require: false },
    family_id: { type: String, require: false },
    chemical_id: { type: String, require: false },
    ingredient_name: { type: String, required: false },
    isActive: { type: Boolean, required: false, default: true },
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
    if (!item.ingredient_name) {
      console.log('WARNING: No "ingredient_name", cannot check if entry already exists!');
      return false;
    }
    // Create Query
    const query = {};
    if (item.ingredient_name) query.ingredient_name = item.ingredient_name;
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

  // Define a model or retrieves it.
  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });

  mongoose.model(modelName, schema, collectionName);
};
