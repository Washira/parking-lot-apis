const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const positionController = require('../controllers/position-controller');

// POST localhost:3000/custom-tcels/api/v1/position
router.post('/custom-tcels/api/v1/position', positionController.postPosition);

// GET localhost:3000/custom-tcels/api/v1/positions
router.get('/custom-tcels/api/v1/positions', queryToMongoose, positionController.getPositions);

// GET localhost:3000/custom-tcels/api/v1/position/5dfce4d99140310364fcc0d9
router.get('/custom-tcels/api/v1/position/:positionId', positionController.getPosition);

// PUT localhost:3000/custom-tcels/api/v1/position/5dfce4d99140310364fcc0d9
router.put('/custom-tcels/api/v1/position/:positionId', positionController.putPosition);

// DELETE localhost:3000/custom-tcels/api/v1/position/5dfce4d99140310364fcc0d9
router.delete('/custom-tcels/api/v1/position/:positionId', positionController.deletePosition);

module.exports = router;
