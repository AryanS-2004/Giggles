const express = require('express');
const asyncHandler = require('express-async-handler')
const Message = require("../models/messageModels");
const User = require("../models/userModels");
const Chat = require("../models/chatModels");


const sendMessage = asyncHandler(async(req, res) =>{
    const {content, chatId} = req.body;

    if(!content || !chatId){
        res.status(401);
        throw new Error('Invalid data')
    }

    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }
    try{
        let message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message,{
            path : "chat.users",
            select : "name email pic",
        });

        await Chat.findByIdAndUpdate(chatId,{
            latestMessage : message
        })
        res.json(message);
    }catch(error){
        res.status(401);
        throw new Error(error.message);
    }
})

const allMessage = asyncHandler(async (req, res) =>{
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

})

module.exports = {sendMessage, allMessage}