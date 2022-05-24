const router = require('express').Router();
const queryToMongoose = require('../core/query-to-mongoose');
const formulaController = require('../controllers/formula-controller');

// POST localhost:3000/custom-rama/api/v1/formulas
router.post('/custom-rama/api/v1/formulas', formulaController.postFormula);

// GET localhost:3000/custom-rama/api/v1/formulas
router.get('/custom-rama/api/v1/formulas', queryToMongoose, formulaController.getFormulas);

// GET localhost:3000/custom-rama/api/v1/formulas/5dfce4d99140310364fcc0d9
router.get('/custom-rama/api/v1/formulas/:formulaId', formulaController.getFormula);

// PUT localhost:3000/custom-rama/api/v1/formulas/5dfce4d99140310364fcc0d9
router.put('/custom-rama/api/v1/formulas/:formulaId', formulaController.putFormula);

// DELETE localhost:3000/custom-rama/api/v1/formulas/5dfce4d99140310364fcc0d9
router.delete('/custom-rama/api/v1/formulas/:formulaId', formulaController.deleteFormula);

module.exports = router;
