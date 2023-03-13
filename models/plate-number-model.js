// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {

  // Sets model & collection name here.
  const modelName = 'PlateNumber';
  const collectionName = 'plateNumber';

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    number: { type: Number, required: true, default: '' },
    size: { type: String, required: true, default: '' },
    is_parked: { type: Boolean, required: false, default: false },
    parking_lot_id: { type: String, required: false, default: '' },
    desc: { type: String, required: false, default: '' },
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
