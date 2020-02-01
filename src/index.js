const http=require('http')
const express= require('express')
const path=require('path')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMsessage,generateLocationMessage}=require('./utils/messages')


const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('new web socket collection')

    socket.emit('message',generateMsessage('Welcome!'))
    socket.broadcast.emit('message',generateMsessage('A new user has joined'))

    socket.on('sendMessage',(message,callback)=>{
        const filter=new Filter()

        if(filter.isProfane(message)){
            return callback('profanity is not allowed')
        }
        io.emit('message',generateMsessage(message))
        callback('delivered')
    })

    socket.on('sendLocation',(coords,callback)=>{
        io.emit('locationmessage',generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()

    })

    socket.on('disconnect',()=>{
        io.emit('message',generateMsessage('user has left'))
    })
})
server.listen(port,()=>{
    console.log(`server is up on port ${port}!`)

})