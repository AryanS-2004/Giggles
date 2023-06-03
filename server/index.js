const express = require('express');
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes')
const {errorHandler, notFound} = require("./middleware/errorMiddleware");
const path = require('path');


dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;


app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);




app.use(notFound);
app.use(errorHandler);



const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
const io = require('socket.io')(
    server, {
        cors: {
            origin : "http://localhost:5173"
        },
        pingTimeout : 60000
    }
)

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) =>{
        socket.join(userData._id);
        socket.emit("connected")
    })

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined roon: " + room);
    })

    socket.on('typing', (room) => {
        socket.in(room).emit('typing');
    })
    socket.on('stop typing', (room) => {
        socket.in(room).emit('stop typing');
    })

    socket.on('new message', (newMessageRecieved) =>{
        let chat = newMessageRecieved.chat;
        if(!chat.users){
            return console.log('chat.users not defined')
        }
        chat.users.forEach(user => {
            if(user._id === newMessageRecieved.sender._id) return ;
            socket.in(user._id).emit("message recieved", newMessageRecieved);
        })
    });

    socket.off('setup', () => {
        console.log("User Disconnected");
        socket.leave(userData._id);
    });


})







// // --------------------------Deployment Code------------------------------
//
// const __dirname1 = path.resolve();
//
// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname1, "/client/dist")));
//
//     app.get("*", (req, res) =>
//         res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"))
//     );
// } else {
//     app.get("/", (req, res) => {
//         res.send("API is running..");
//     });
// }
//
// // --------------------------deployment------------------------------
