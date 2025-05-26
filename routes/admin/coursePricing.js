const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const pricingController = require('../../controllers/admin/coursePricingController');

router.use(auth, requireAdmin);

// Get all pricing plans for a course
router.get('/:courseId', pricingController.getPricingPlansByCourse);

// Create new pricing plan
router.post('/', pricingController.createPricingPlan);

// Update pricing plan
router.put('/:id', pricingController.updatePricingPlan);

// Delete pricing plan
router.delete('/:id', pricingController.deletePricingPlan);

module.exports = router;
