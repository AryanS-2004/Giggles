const auth =require( "../middleware/authMiddleware");
const  {allMessage,  sendMessage} = require( "../controllers/messageController");

const express = require('express');
const router = express.Router();

router.route('/').post(auth, sendMessage);
router.route('/:chatId').get(auth, allMessage);



module.exports =  router;
