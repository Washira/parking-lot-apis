// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {
  const { Schema } = mongoose;

  // Sets model & collection name here.
  const modelName = 'ParkingLot';
  const collectionName = 'parkingLot';

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    name: { type: String, required: true, default: '' },
    lot_number: { type: Number, required: false, default: '' },
    size: { type: String, required: false, default: '' },
    is_allocated: { type: Boolean, required: false, default: false },
    is_active: { type: Boolean, required: false, default: true },
    plate_number_allocated: {
      required: false,
      default: null,
      type: new Schema({
        _id: { type: String, required: false },
        number: { type: Number, required: false },
        size: { type: String, required: false },
        desc: { type: String, required: false },
      }, {
        strict: false,
      }),
    },
  }, {
    id: false,
    strict: false,
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
