const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)

const port = 3000

app.use(express.static('public'))

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/index.html')
})

const players = {}


io.on('connection', (socket)=>{
    console.log('A user connected ')
    players[socket.id] ={
        x:300,
        y:300
    }
    console.log(players)
    io.emit('updatePlayer' , players)
    socket.on('disconnect',()=>{
        console.log('player left')
        delete players[socket.id]
    })
    

})

server.listen(port, ()=> {
    console.log(`App is listening on ${port}`)
} )
