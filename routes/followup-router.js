const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const followupController = require('../controllers/followup-controller');

// POST localhost:3000/custom-rama/api/v1/followups
router.post('/custom-rama/api/v1/followups', followupController.postFollowup);

// GET localhost:3000/custom-rama/api/v1/followups
router.get('/custom-rama/api/v1/followups', queryToMongoose, followupController.getFollowups);

// GET localhost:3000/custom-rama/api/v1/followups/5dfce4d99140310364fcc0d9
router.get('/custom-rama/api/v1/followups/:followupId', followupController.getFollowup);

// PUT localhost:3000/custom-rama/api/v1/followups/5dfce4d99140310364fcc0d9
router.put('/custom-rama/api/v1/followups/:followupId', followupController.putFollowup);

// DELETE localhost:3000/custom-rama/api/v1/followups/5dfce4d99140310364fcc0d9
router.delete('/custom-rama/api/v1/followups/:followupId', followupController.deleteFollowup);

module.exports = router;
