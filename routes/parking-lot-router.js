const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const parkingLotController = require('../controllers/parking-lot-controller');

// POST localhost:3000/parking/api/v1/parkings
router.post('/parking/api/v1/parkings', parkingLotController.postParkingLot);

// GET localhost:3000/parking/api/v1/parkings
router.get('/parking/api/v1/parkings', queryToMongoose, parkingLotController.getParkingLot);

// GET localhost:3000/parking/api/v1/parkings/5dfce4d99140310364fcc0d9
router.get('/parking/api/v1/parkings/:parkingLotId', parkingLotController.getOneParkingLot);

// GET localhost:3000/parking/api/v1/parking-status/5dfce4d99140310364fcc0d9
router.get('/parking/api/v1/parking-status/:parkingLotId', parkingLotController.getOneParkingLotStatus);

// GET localhost:3000/parking/api/v1/find-one-available-parking
router.get('/parking/api/v1/find-one-available-parking', parkingLotController.getOneAvailableParkingLot);

// PUT localhost:3000/parking/api/v1/parkings/5dfce4d99140310364fcc0d9
router.put('/parking/api/v1/parkings/:parkingLotId', parkingLotController.putParkingLot);

// PUT localhost:3000/parking/api/v1/parkcar
router.put('/parking/api/v1/parkcar', parkingLotController.parkOneCar);

// PUT localhost:3000/parking/api/v1/leavecar
router.put('/parking/api/v1/leavecar', parkingLotController.leaveCar);

// DELETE localhost:3000/parking/api/v1/parkings/5dfce4d99140310364fcc0d9
router.delete('/parking/api/v1/parkings/:parkingLotId', parkingLotController.deleteParkingLot);

module.exports = router;
