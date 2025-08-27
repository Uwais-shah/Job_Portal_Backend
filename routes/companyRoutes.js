const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:user_id', companyController.getCompanyWithUserInfo);
router.put('/:user_id', companyController.updateCompanyProfile);

// Report a company - using a more specific path to avoid conflicts
router.post('/report/:companyId', protect, companyController.reportCompany);

// Get company status for dashboard
router.get('/:companyId/status', protect, companyController.getCompanyStats);

module.exports = router;
