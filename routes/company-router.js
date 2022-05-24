const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const companyController = require('../controllers/company-controller');

// POST localhost:3000/custom-tcels/api/v1/company
router.post('/custom-tcels/api/v1/company', companyController.postCompany);

// GET localhost:3000/custom-tcels/api/v1/companies
router.get('/custom-tcels/api/v1/companies', queryToMongoose, companyController.getCompanies);

// GET localhost:3000/custom-tcels/api/v1/companies/5dfce4d99140310364fcc0d9
router.get('/custom-tcels/api/v1/company/:companyId', companyController.getCompany);

// PUT localhost:3000/custom-tcels/api/v1/company/5dfce4d99140310364fcc0d9
router.put('/custom-tcels/api/v1/company/:companyId', companyController.putCompany);

// DELETE localhost:3000/custom-tcels/api/v1/company/5dfce4d99140310364fcc0d9
router.delete('/custom-tcels/api/v1/company/:companyId', companyController.deleteCompany);

module.exports = router;
