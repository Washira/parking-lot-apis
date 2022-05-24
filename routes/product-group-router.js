const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const productGroupController = require('../controllers/product-group-controller');

// POST localhost:3000/custom-rama/api/v1/productGroups
router.post('/custom-rama/api/v1/productGroups', productGroupController.postProductGroup);

// POST localhost:3000/custom-rama/api/v1/upload/productGroups/import-csv
router.post('/custom-rama/api/v1/productGroups/upload/import-csv', productGroupController.multerImportCsv.single('file'), productGroupController.postImportCsv);

// GET localhost:3000/custom-rama/api/v1/productGroups
router.get('/custom-rama/api/v1/productGroups', queryToMongoose, productGroupController.getProductGroups);

// GET localhost:3000/custom-rama/api/v1/productGroups/5dfce4d99140310364fcc0d9
router.get('/custom-rama/api/v1/productGroups/:productGroupId', productGroupController.getProductGroup);

// PUT localhost:3000/custom-rama/api/v1/productGroups/5dfce4d99140310364fcc0d9
router.put('/custom-rama/api/v1/productGroups/:productGroupId', productGroupController.putProductGroup);

// DELETE localhost:3000/custom-rama/api/v1/productGroups/5dfce4d99140310364fcc0d9
router.delete('/custom-rama/api/v1/productGroups/:productGroupId', productGroupController.deleteProductGroup);

module.exports = router;
