// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {
  const { Schema } = mongoose;
  const { Mixed } = mongoose.Schema.Types;

  // Sets model & collection name here.
  const modelName = 'Followup';
  const collectionName = 'followups';

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    detail: { type: String, required: true },
    detail_raw: { type: Mixed, required: false },
    ticket_id: { type: String, required: true },
    attachments: [{
      id: { type: String, required: true },
      file_name: { type: String, required: true },
      length: { type: Number, required: false },
      uploadDate: { type: String, required: false },
    }],
    followup_at: { type: Date, required: false },
    followup_by: {
      required: false,
      type: new Schema({
        _id: { type: String, required: true },
        title_prefix: { type: String, required: false },
        name: { type: String, required: true },
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        username: { type: String, required: false },
      }, {
        strict: true,
      }),
    },
  }, {
    id: false,
    strict: true,
    minimize: false,
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
