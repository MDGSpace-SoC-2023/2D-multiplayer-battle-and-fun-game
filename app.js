const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)

const port = process.env.port ||3000

app.use(express.static('public'))

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/index.html')
})

const players = {}
const backendprojectiles = {}
let projectileID=0

io.on('connection', (socket)=>{
    console.log('A user connected ')
    socket.on('boundaries',(boundaries)=>{
        for(const id in boundaries){
            const boundary = boundaries[id]
            
        }
    })
    socket.on('playerlocation',(position)=>{
        players[socket.id].xx = position.x 
        players[socket.id].yy = position.y 
        io.emit('updatePlayer', players)
        
    })
    socket.on('playersprite',(image)=>{
        players[socket.id].sprite = image
        io.emit('updatePlayer', players)
    })
    socket.on('mute',(condition)=>{
        if(players[socket.id]){
        players[socket.id].mute = condition
    }
        io.emit('updatePlayer',players)
    })
    socket.on('addusername',(username)=>{
        
        players[socket.id] ={
        xx: 640,
        yy:400,
        username: username,
        score :0,
        xp:215,
        roomid:1,
        keys : {
            w: {pressed: false},
            a: {pressed: false},
            s: {pressed: false},
            d: {pressed: false},
            q: {pressed: false}
        }
        
    }
    io.emit('updatePlayer', players)
    })
    

    socket.on('roomchange',(id)=>{
        players[socket.id].roomid=id
        io.emit('updatePlayer', players)
        socket.emit('event',id)

    })

    socket.on('shoot', ({ x, y, angle ,hotbarid,playerpos}) => {
        projectileID++;
        const velocity = {
            x: Math.cos(angle) * 20,
            y: Math.sin(angle) * 20
        }
        backendprojectiles[projectileID] = {
            x, y, velocity, playerID: socket.id,hotbarid,playerpos
        }
    })

    socket.on('projectilecollision',(id)=>{
        delete backendprojectiles[id]
    })
    socket.on('projectilecollisionwp',({id,pid})=>{
        players[id].xp-=10
        if(players[id].xp<=0){
            delete players[id]
        }
        delete backendprojectiles[pid]
        io.emit('score--ofid',id)
        io.emit('updatePlayer',players)

    })
    socket.on('keys',(keys)=>{
        players[socket.id].keys = keys
        io.emit('updatePlayer',players)
    })
    socket.on('stops',({id,playerid})=>{
        if(id=="heal"&& players[playerid].xp<=215){
            players[playerid].xp+=0.2
            
        }
        io.emit('score--ofid',playerid)
        io.emit('updatePlayer',players)
    })
    socket.on('blastdamage',(id)=>{
         
         if(players[id].xp<=0){
            delete players[id]
        }
        if(players[id]){players[id].xp-=20}
          io.emit('score--ofid',id)
          io.emit('updatePlayer',players)


    })

    socket.on('disconnect',(reason)=>{
        console.log(reason)
        delete players[socket.id]
        io.emit('updatePlayer',players)
    })

})

setInterval(() => {
    for (const id in backendprojectiles) {
        if(backendprojectiles[id].hotbarid==6){
        backendprojectiles[id].x += backendprojectiles[id].velocity.x/3
        backendprojectiles[id].y += backendprojectiles[id].velocity.y/3
        const lastx = backendprojectiles[id].x-backendprojectiles[id].playerpos.x  
        const lasty = backendprojectiles[id].y-backendprojectiles[id].playerpos.y 
        if(Math.sqrt(lastx*lastx + lasty*lasty)>200){
          
          io.emit('blast',({lastx:backendprojectiles[id].x,lasty:backendprojectiles[id].y}))
          delete backendprojectiles[id]
       }
        }
        else{
            backendprojectiles[id].x += backendprojectiles[id].velocity.x
            backendprojectiles[id].y += backendprojectiles[id].velocity.y

        }
    }
    io.emit('updateprojectiles', backendprojectiles)
    // io.emit('updatePlayer',players)
},15)

server.listen(port, ()=> {
    console.log(`App is listening on ${port}`)
} )
