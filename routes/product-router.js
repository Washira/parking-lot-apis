const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const productController = require('../controllers/product-controller');

// POST localhost:3000/custom-rama/api/v1/products
router.post('/custom-rama/api/v1/products', productController.postProduct);

// POST localhost:3000/custom-rama/api/v1/upload/ingredients/import-csv
router.post('/custom-rama/api/v1/products/upload/import-csv', productController.multerImportCsv.single('file'), productController.postImportCsv);

// GET localhost:3000/custom-rama/api/v1/products
router.get('/custom-rama/api/v1/products', queryToMongoose, productController.getProducts);

// GET localhost:3000/custom-rama/api/v1/products/5dfce4d99140310364fcc0d9
router.get('/custom-rama/api/v1/products/:productId', productController.getProduct);

// PUT localhost:3000/custom-rama/api/v1/products/5dfce4d99140310364fcc0d9
router.put('/custom-rama/api/v1/products/:productId', productController.putProduct);

// DELETE localhost:3000/custom-rama/api/v1/products/5dfce4d99140310364fcc0d9
router.delete('/custom-rama/api/v1/products/:productId', productController.deleteProduct);

module.exports = router;
