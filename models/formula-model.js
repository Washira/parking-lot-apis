// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {

  // Sets model & collection name here.
  const modelName = 'Formula';
  const collectionName = 'formulas';

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    name: { type: String, required: true },
    text: { type: String, required: true },
  }, {
    id: false,
    strict: true,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  });

  // Define a model or retrieves it.
  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });

  mongoose.model(modelName, schema, collectionName);
};
