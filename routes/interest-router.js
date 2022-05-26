const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const interestController = require('../controllers/interest-controller');

// POST localhost:3000/custom-tcels/api/v1/interest
router.post('/custom-tcels/api/v1/interest', interestController.postInterest);

// GET localhost:3000/custom-tcels/api/v1/interests
router.get('/custom-tcels/api/v1/interests', queryToMongoose, interestController.getInterests);

// GET localhost:3000/custom-tcels/api/v1/interest/5dfce4d99140310364fcc0d9
router.get('/custom-tcels/api/v1/interest/:interestId', interestController.getInterest);

// PUT localhost:3000/custom-tcels/api/v1/interest/5dfce4d99140310364fcc0d9
router.put('/custom-tcels/api/v1/interest/:interestId', interestController.putInterest);

// DELETE localhost:3000/custom-tcels/api/v1/interest/5dfce4d99140310364fcc0d9
router.delete('/custom-tcels/api/v1/interest/:interestId', interestController.deleteInterest);

module.exports = router;
