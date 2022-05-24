// NOTE: Do not use arrow function for virtual-property and static-method.
module.exports = (mongoose) => {

  // Sets model & collection name here.
  const modelName = 'ProductGroup';
  const collectionName = 'product_groups';

  const DEBUG = process.env.production;

  /**
   * Define model schema and validation here.
   * https://mongoosejs.com/docs/validation.html
   */
  const schema = new mongoose.Schema({
    name: { type: String, required: false },
    parent: { type: String, required: false, default: '//' },
    path: { type: String, required: false },
    level: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    detail: { type: String, required: false },
    group: {
      lookup_id: { type: String, required: false },
      category_id: { type: String, required: false },
      family_id: { type: String, required: false },
      chemical_id: { type: String, required: false },
      category_name: { type: String, required: false },
      family_name: { type: String, required: false },
      chemical_name: { type: String, required: false },
    },
    isActive: { type: Boolean, required: true, default: true },
  }, {
    id: false,
    strict: true,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  });

  // A static method to detect category level.
  schema.statics.findLevel = async function (category) {
    // Default category level (invalid level)
    let categoryLevel = 0;

    // The category is root level?
    if (category.parent === '//') {
      categoryLevel = 1;
    }

    // The category isn't root level?
    if (category.parent !== '//') {
      // Find the parent category doc.
      await this.findOne({ path: category.parent })
        .then((parent) => {
          parent.level = parent.level || 0;
          categoryLevel = parent.level + 1;
        })
        .catch((err) => {
          categoryLevel = 0;
          console.log('ERROR during findLevel.findOne(): ', err);
        });
    }

    return categoryLevel;
  };

  // A static method to detect if similar entry exists.
  schema.statics.checkExists = async function (item) {
    // Not enough data
    if (!item.group) {
      console.log('WARNING: No "group" data, cannot check if entry already exists!');
      return false;
    }
    // Create Query
    const query = {};
    if (item.group.category_name) query['group.category_name'] = item.group.category_name;
    if (item.group.family_name) query['group.family_name'] = item.group.family_name;
    if (item.group.chemical_name) query['group.chemical_name'] = item.group.chemical_name;
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

  // A static method to detect if similar entry exists.
  schema.statics.checkExistingPathAndName = async function (category) {
    // Find the parent category doc.
    const query = { path: category.path, name: category.name };
    const exists = await this.findOne(query)
      .then((doc) => {
        return (doc !== null);
      })
      .catch((err) => {
        console.log('ERROR during checkExistingPathAndName.findOne(): ', err);
      });

    return exists;
  };

  // Create unique category path automatically.
  schema.pre('save', async function (next) {
    // Skip processing the save, in pre-save hook
    if (!this.model) {
      if (DEBUG) console.log('[PRODUCTGROUP pre-save] Model is UnDefined!!', this.model);
      return;
    }
    // Process the pre-save hook
    this.path = `//${this.name}`;
    this.path = this.parent !== '//' ? this.parent + this.path : this.path;
    this.level = await this.constructor.findLevel(this);
    // Check for duplicate entries based on Path and Name
    if (await this.constructor.checkExistingPathAndName(this)) {
      console.log(`WARNING: Path/Name Entry Already Exists { path: '${this.path}', name: '${this.name}' }`);
    }
    next();
  });

  // Update unique category path automatically.
  schema.pre('findOneAndUpdate', async function (next) {
    this._update.path = `//${this._update.name}`;
    this._update.path = this._update.parent !== '//' ? this._update.parent + this._update.path : this._update.path;
    if (this._update.parent) this._update.level = await this.model.findLevel(this._update);
    next();
  });

  // Define a model or retrieves it.
  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });

  mongoose.model(modelName, schema, collectionName);
};
