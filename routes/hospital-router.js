const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const hospitalController = require('../controllers/hospital-controller');

// POST localhost:3000/custom-rama/api/v1/hospitals
router.post('/custom-rama/api/v1/hospitals', hospitalController.postHospital);

// GET localhost:3000/custom-rama/api/v1/hospitals
router.get('/custom-rama/api/v1/hospitals', queryToMongoose, hospitalController.getHospitals);

// GET localhost:3000/custom-rama/api/v1/hospitals/5dfce4d99140310364fcc0d9
router.get('/custom-rama/api/v1/hospitals/:hospitalId', hospitalController.getHospital);

// PUT localhost:3000/custom-rama/api/v1/hospitals/5dfce4d99140310364fcc0d9
router.put('/custom-rama/api/v1/hospitals/:hospitalId', hospitalController.putHospital);

// DELETE localhost:3000/custom-rama/api/v1/hospitals/5dfce4d99140310364fcc0d9
router.delete('/custom-rama/api/v1/hospitals/:hospitalId', hospitalController.deleteHospital);

module.exports = router;
