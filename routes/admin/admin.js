const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController")




router.post('/', adminController.loginWithEmail);




module.exports = router;