const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../../middleware/auth');
const couponController = require('../../controllers/admin/couponController');

// router.use(auth, requireAdmin);

router.get('/', couponController.getAllCoupons);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
