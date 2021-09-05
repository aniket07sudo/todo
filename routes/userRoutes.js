const express = require('express');
const app = require('../server');
const router = express.Router();
const authController = require('../controller/authController');

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/getUser", authController.getUserByToken);
router.post("/deleteNote", authController.deleteNote);
router.post("/addNotes",authController.isLoggedIn,authController.uploadUserPhoto,authController.resizePhoto, authController.addNotes);



module.exports = router;