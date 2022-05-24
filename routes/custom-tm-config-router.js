const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const customTMConfigController = require('../controllers/custom-tm-config-controller');

// GET localhost:3000/custom-rama/api/v1/productGroups
router.get('/custom-rama/api/v1/customTMConfigs', queryToMongoose, customTMConfigController.getCustomTMConfigs);

// GET localhost:3000/custom-rama/api/v1/productGroups/5dfce4d99140310364fcc0d9
router.get('/custom-rama/api/v1/customTMConfigs/:customTMConfigId', customTMConfigController.getCustomTMConfig);

// PUT localhost:3000/custom-rama/api/v1/productGroups/5dfce4d99140310364fcc0d9
router.put('/custom-rama/api/v1/customTMConfigs/:customTMConfigId', customTMConfigController.putCustomTMConfig);

// DELETE localhost:3000/custom-rama/api/v1/productGroups/5dfce4d99140310364fcc0d9
router.delete('/custom-rama/api/v1/customTMConfigs/:customTMConfigId', customTMConfigController.deleteCustomTMConfig);

// POST localhost:3000/custom-rama/api/v1/customTMConfig/upload/productGroups/import-csv
router.post('/custom-rama/api/v1/customTMConfig/upload/import-csv', customTMConfigController.multerImportCsv.single('file'), customTMConfigController.postImportCsv);

// POST localhost:3000/custom-rama/api/v1/productGroups
router.post('/custom-rama/api/v1/customTMConfigs', customTMConfigController.postCustomTMConfig);

module.exports = router;
