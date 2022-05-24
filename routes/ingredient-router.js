const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const ingredientController = require('../controllers/ingredient-controller');

// POST localhost:3000/custom-rama/api/v1/ingredients
router.post('/custom-rama/api/v1/ingredients', ingredientController.postIngredient);

// POST localhost:3000/custom-rama/api/v1/upload/ingredients/import-csv
router.post('/custom-rama/api/v1/ingredients/upload/import-csv', ingredientController.multerImportCsv.single('file'), ingredientController.postImportCsv);

// GET localhost:3000/custom-rama/api/v1/ingredients
router.get('/custom-rama/api/v1/ingredients', queryToMongoose, ingredientController.getIngredients);

// GET localhost:3000/custom-rama/api/v1/ingredients/5dfce4d99140310364fcc0d9
router.get('/custom-rama/api/v1/ingredients/:ingredientId', ingredientController.getIngredient);

// PUT localhost:3000/custom-rama/api/v1/ingredients/5dfce4d99140310364fcc0d9
router.put('/custom-rama/api/v1/ingredients/:ingredientId', ingredientController.putIngredient);

// DELETE localhost:3000/custom-rama/api/v1/ingredients/5dfce4d99140310364fcc0d9
router.delete('/custom-rama/api/v1/ingredients/:ingredientId', ingredientController.deleteIngredient);

module.exports = router;
