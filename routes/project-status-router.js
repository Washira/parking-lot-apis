const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const projectStatusController = require('../controllers/project-status-controller');

// POST localhost:3000/custom-tcels/api/v1/projectStatus
router.post('/custom-tcels/api/v1/projectStatus', projectStatusController.postProjectStatus);

// GET localhost:3000/custom-tcels/api/v1/projectStatuses
router.get('/custom-tcels/api/v1/projectStatuses', queryToMongoose, projectStatusController.getProjectStatuses);

// GET localhost:3000/custom-tcels/api/v1/projectStatus/5dfce4d99140310364fcc0d9
router.get('/custom-tcels/api/v1/projectStatus/:projectStatusId', projectStatusController.getProjectStatus);

// PUT localhost:3000/custom-tcels/api/v1/projectStatus/5dfce4d99140310364fcc0d9
router.put('/custom-tcels/api/v1/projectStatus/:projectStatusId', projectStatusController.putProjectStatus);

// DELETE localhost:3000/custom-tcels/api/v1/projectStatus/5dfce4d99140310364fcc0d9
router.delete('/custom-tcels/api/v1/projectStatus/:projectStatusId', projectStatusController.deleteProjectStatus);

module.exports = router;
