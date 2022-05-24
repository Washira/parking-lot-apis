const router = require('express').Router();
const scriptController = require('../controllers/script-controller');

// GET localhost:3000/custom-rama/api/v1/scripts/execute-update-patient-sequence
router.get('/custom-rama/api/v1/scripts/execute-update-patient-sequence', scriptController.getExecuteUpdatePatientSequence);

// GET localhost:3000/custom-rama/api/v1/scripts/execute-add-same-ytd-tickets
router.get('/custom-rama/api/v1/scripts/execute-add-same-ytd-tickets', scriptController.getExecuteAddSameYtdTickets);

// GET localhost:3000/custom-rama/api/v1/scripts/execute-add-ytd-patients
router.get('/custom-rama/api/v1/scripts/execute-add-ytd-patients', scriptController.getExecuteAddYtdPatients);

// GET localhost:3000/custom-rama/api/v1/scripts/execute-migrate-followup-activities
router.get('/custom-rama/api/v1/scripts/execute-migrate-followup-activities', scriptController.getExecuteMigrateFollowupActivities);

// GET localhost:3000/custom-rama/api/v1/scripts/execute-attach-ticket-id-to-ticket-logs
router.get('/custom-rama/api/v1/scripts/execute-attach-ticket-id-to-ticket-logs', scriptController.getExecuteAttachTicketIdToTicketLogs);

// GET localhost:3000/custom-rama/api/v1/scripts/execute-attach-person-to-ticket-logs
router.get('/custom-rama/api/v1/scripts/execute-attach-person-to-ticket-logs', scriptController.getExecuteAttachPersonToTicketLogs);

// GET localhost:3000/custom-rama/api/v1/scripts/execute-remove-duplicate-substance-list
router.get('/custom-rama/api/v1/scripts/execute-remove-duplicate-substance-list', scriptController.getExecuteRemoveDuplicateSubstanceList);

// GET localhost:3000/custom-rama/api/v1/scripts/execute-fix-created-at-timezone
router.get('/custom-rama/api/v1/scripts/execute-fix-created-at-timezone', scriptController.getExecuteFixCreatedAtTimezone);

// GET localhost:3000/custom-rama/api/v1/scripts/execute-fix-duplicate-contact-points
router.get('/custom-rama/api/v1/scripts/execute-fix-duplicate-contact-points', scriptController.getExecuteFixDuplicateContactPoints);

// GET localhost:3000/custom-rama/api/v1/scripts/execute-delete-unused-contact-points
router.get('/custom-rama/api/v1/scripts/execute-delete-unused-contact-points', scriptController.getExecuteDeleteUnusedContactPoints);

module.exports = router;
