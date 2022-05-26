const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const projectController = require('../controllers/project-controller');

// POST localhost:3000/custom-tcels/api/v1/project
router.post('/custom-tcels/api/v1/project', projectController.postProject);

// GET localhost:3000/custom-tcels/api/v1/projects
router.get('/custom-tcels/api/v1/projects', queryToMongoose, projectController.getProjects);

// GET localhost:3000/custom-tcels/api/v1/project/5dfce4d99140310364fcc0d9
router.get('/custom-tcels/api/v1/project/:positionId', projectController.getProject);

// PUT localhost:3000/custom-tcels/api/v1/project/5dfce4d99140310364fcc0d9
router.put('/custom-tcels/api/v1/project/:positionId', projectController.putProject);

// DELETE localhost:3000/custom-tcels/api/v1/project/5dfce4d99140310364fcc0d9
router.delete('/custom-tcels/api/v1/project/:positionId', projectController.deleteProject);

module.exports = router;
