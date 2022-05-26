const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const departmentOwnerController = require('../controllers/department-owner-controller');

// POST localhost:3000/custom-tcels/api/v1/departmentOwner
router.post('/custom-tcels/api/v1/department-owner', departmentOwnerController.postDepartmentOwner);

// GET localhost:3000/custom-tcels/api/v1/department-owners
router.get('/custom-tcels/api/v1/department-owners', queryToMongoose, departmentOwnerController.getDepartmentOwners);

// GET localhost:3000/custom-tcels/api/v1/department-owner/5dfce4d99140310364fcc0d9
router.get('/custom-tcels/api/v1/department-owner/:departmentOwnerId', departmentOwnerController.getDepartmentOwner);

// PUT localhost:3000/custom-tcels/api/v1/department-owner/5dfce4d99140310364fcc0d9
router.put('/custom-tcels/api/v1/department-owner/:departmentOwnerId', departmentOwnerController.putDepartmentOwner);

// DELETE localhost:3000/custom-tcels/api/v1/department-owner/5dfce4d99140310364fcc0d9
router.delete('/custom-tcels/api/v1/department-owner/:departmentOwnerId', departmentOwnerController.deleteDepartmentOwner);

module.exports = router;
