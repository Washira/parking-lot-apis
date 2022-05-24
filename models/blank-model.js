// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {

  // Sets model & collection name here.
  const modelName = 'Blank';
  const collectionName = 'blanks';

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    foo: { type: String },
    bar: { type: String },
  }, {
    id: false,
    strict: true,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  });

  /**
   * Adds new hooks below this line.
   */
  schema.pre('save', (next) => {
    next();
  });

  /**
   * Adds new virtual properties below this line.
   */
  schema.virtual('fooBar').get(function () {
    return `${this.foo} ${this.bar}`;
  });

  /**
   * Adds new static methods below this line.
   */
  schema.statics.findOneByFoo = function (foo) {
    return this.findOne({ foo });
  };

  // Define a model or retrieves it.
  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });

  mongoose.model(modelName, schema, collectionName);
};
