const express = require('express')
const http = require('http')
const path = require('path')
const PORT = process.env.PORT || 3000;
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

var app = express()
const server = http.createServer(app)
const io = socketio(server)

//Set Static Folder
app.use(express.static(path.join(__dirname, 'Public')))

const botname = 'ChatChord Bot'

//Run when a client connects
io.on('connection', (socket)=>{


    socket.on('joinroom', ({username, room})=>{

        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        //Welcome User
        socket.emit('message', formatMessage(botname, 'Welcome to ChatCord!'))

        //Brodcasting When user connects
        socket.broadcast
        .to(room)
        .emit('message', formatMessage(botname,`${user.username} has  joined the chat`))

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)

        })
    })



    //Listen for Chat message
    socket.on('chatMsg', (message)=>{
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, message))
    })

    //When client Disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id)
        if(user){
            
            io.to(user.room).emit('message', formatMessage(botname,`${user.username} has left  the chat!`))
            
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
    
            })
        }
        
    })

})

server.listen(PORT, ()=>{
    console.log(`Server Up and running on : ${PORT}`)
})