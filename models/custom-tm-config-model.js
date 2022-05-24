module.exports = (mongoose) => {

  // Sets model & collection name here.
  const modelName = 'CustomTMConfig';
  const collectionName = 'custom_tm_configs';

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    oldId: { type: String, required: true, default: null }, // For use with migration debug only
    name: { type: String, required: true },
    groupName: { type: String, required: true },
    subGroup: { type: String, required: true },
    desc: { type: String, required: false },
    isActive: { type: Boolean, required: true, default: true },
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
