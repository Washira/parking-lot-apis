const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const productIngredientController = require('../controllers/product-ingredient-controller');

// POST localhost:3000/custom-rama/api/v1/productIngredients
router.post('/custom-rama/api/v1/productIngredients', productIngredientController.postProductIngredient);

// POST localhost:3000/custom-rama/api/v1/upload/productIngredients/import-csv
router.post('/custom-rama/api/v1/productIngredients/upload/import-csv', productIngredientController.multerImportCsv.single('file'), productIngredientController.postImportCsv);

// GET localhost:3000/custom-rama/api/v1/productIngredients
router.get('/custom-rama/api/v1/productIngredients', queryToMongoose, productIngredientController.getProductIngredients);

// GET localhost:3000/custom-rama/api/v1/productIngredients/5dfce4d99140310364fcc0d9
router.get('/custom-rama/api/v1/productIngredients/:productIngredientId', productIngredientController.getProductIngredient);

// PUT localhost:3000/custom-rama/api/v1/productIngredients/5dfce4d99140310364fcc0d9
router.put('/custom-rama/api/v1/productIngredients/:productIngredientId', productIngredientController.putProductIngredient);

// DELETE localhost:3000/custom-rama/api/v1/productIngredients/5dfce4d99140310364fcc0d9
router.delete('/custom-rama/api/v1/productIngredients/:productIngredientId', productIngredientController.deleteProductIngredient);

module.exports = router;
