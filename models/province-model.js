// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {

  // Sets model & collection name here.
  const modelName = 'Province';
  const collectionName = 'provinces';

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    name: { type: String, required: true, default: '' },
    regional: { type: String, required: true, default: '' },
    regionName: { type: String, required: true, default: '' },
    order: { type: Number, required: false, default: 0 },
    isActive: { type: Boolean, default: true },
  }, {
    id: false,
    strict: true,
    timestamps: false,
  });

  // Define a model or retrieves it.
  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });

  mongoose.model(modelName, schema, collectionName);
};
