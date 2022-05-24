const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const provinceController = require('../controllers/province-controller');

// POST localhost:3000/custom-rama/api/v1/provinces
router.post('/custom-rama/api/v1/provinces', provinceController.postProvince);

// GET localhost:3000/custom-rama/api/v1/provinces
router.get('/custom-rama/api/v1/provinces', queryToMongoose, provinceController.getProvinces);

// GET localhost:3000/custom-rama/api/v1/provinces/5dfce4d99140310364fcc0d9
router.get('/custom-rama/api/v1/provinces/:provinceId', provinceController.getProvince);

// PUT localhost:3000/custom-rama/api/v1/provinces/5dfce4d99140310364fcc0d9
router.put('/custom-rama/api/v1/provinces/:provinceId', provinceController.putProvince);

// DELETE localhost:3000/custom-rama/api/v1/provinces/5dfce4d99140310364fcc0d9
router.delete('/custom-rama/api/v1/provinces/:provinceId', provinceController.deleteProvince);

module.exports = router;
