const express = require('express');
const {registerUser, authUser, allUsers} = require("../controllers/userControllers");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.route('/').post(registerUser);
router.route('/login').post(authUser);
router.route('/',).get(auth, allUsers);


module.exports = router;