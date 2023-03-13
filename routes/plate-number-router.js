const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const plateNumberController = require('../controllers/plate-number-controller');

// POST localhost:3000/parking/api/v1/plate-numbers
router.post('/parking/api/v1/plate-numbers', plateNumberController.postPlateNumber);

// GET localhost:3000/parking/api/v1/plate-numbers
router.get('/parking/api/v1/plate-numbers', queryToMongoose, plateNumberController.getPlateNumber);

// GET localhost:3000/parking/api/v1/plate-numbers/5dfce4d99140310364fcc0d9
router.get('/parking/api/v1/plate-numbers/:plateNumberId', plateNumberController.getOnePlateNumber);

// PUT localhost:3000/parking/api/v1/plate-numbers/5dfce4d99140310364fcc0d9
router.put('/parking/api/v1/plate-numbers/:plateNumberId', plateNumberController.putPlateNumber);

// DELETE localhost:3000/parking/api/v1/plate-numbers/5dfce4d99140310364fcc0d9
router.delete('/parking/api/v1/plate-numbers/:plateNumberId', plateNumberController.deletePlateNumber);

module.exports = router;
