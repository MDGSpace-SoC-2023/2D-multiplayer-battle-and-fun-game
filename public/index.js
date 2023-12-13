const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io(`ws://localhost:3000`)
//==========================//

canvas.width = 1324
canvas.height = 600
c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

//=========================//

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 160) {  //converting 1D array to 2D
    collisionsMap.push(collisions.slice(i,160+i)) 
}
 
const offset = {x: -815,y : -900}//Offset to the map

const boundaries = []
collisionsMap.forEach((row, i) => {
    row.forEach((Symbol, j) => {
        if(Symbol === 2227){
         boundaries.push(new Boundary({             //converting 2D array into blocks with position defined
            position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
            }
         }))
        }
    })
})

//==========Loading inmages=========//

const image = new Image()
image.src = './img/background.png'
const playerdownImage = new Image()
playerdownImage.src = './img/playerDown.png'
const Foreground = new Image()
Foreground.src = './img/foreground.png'
const playerupImage = new Image()
playerupImage.src = './img/playerUp.png'
const playerleftImage = new Image()
playerleftImage.src = './img/playerLeft.png'
const playerrightImage = new Image()
playerrightImage.src = './img/playerRight.png'

//================================//




//=============Player sprite=============//
let player = new Sprite({
    position:{
        x: canvas.width / 2 - (playerdownImage.width / 4) / 2,
        y: canvas.height / 2 - playerdownImage.height / 2
    },
    image : playerdownImage,
    frames:{
        max:4
    },
    sprites :{
        up:  playerupImage,
        left : playerleftImage,
        down : playerdownImage,
        right : playerrightImage,
    }
})


const players = {}
let other ={}

socket.on('updatePlayer', (backendPlayers) => {
    
    for (const id in backendPlayers) {
        const backendPlayer = backendPlayers[id];
        if (!players[id]) {
            players[id] = new Sprite({
                position: {
                    x: (canvas.width / 2 - (playerdownImage.width / 4) / 2)*Math.random(), //for testing random added
                    y: (canvas.height / 2 - playerdownImage.height / 2)*Math.random()
                },
                image: playerdownImage,
                frames: {
                    max: 4
                },
                sprites: {
                    up: playerupImage,
                    left: playerleftImage,
                    down: playerdownImage,
                    right: playerrightImage,
                }
            });
        
        }}
    for(const id in players){
        if(!backendPlayers[id]){
            delete players[id]
        }
    }
    for(const id in players){
        if(socket.id != id){
          other[id] = players[id]
        }
    }
});

//============================================//
const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: Foreground
})

const keys = {
    w: {pressed: false},
    a: {pressed: false},
    s: {pressed: false},
    d: {pressed: false}
}

const movableitems = [background,...boundaries,foreground] //  "..." represents every elements in that array

let touchup,touchdown,touchleft,touchright

window.addEventListener('touchstart',touchstart)
window.addEventListener('touchmove', touchmove)
window.addEventListener('touchend',touchend)



function animate(){
    requestAnimationFrame(animate)
    background.draw()
    // boundaries.forEach(boundary => {boundary.draw()})  //can we used to locate barrier blocks
    for(const id in players){
        const player =players[id]
        player.draw()
    }
    // player.draw()
    foreground.draw()
    // console.log(player)
    let moving = true
    player.moving=false


   players[socket.id].moving = false

    if (keys.w.pressed || touchup===true){
        
        players[socket.id].moving = true
        players[socket.id].image = players[socket.id].sprites.up
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: players[socket.id],
                rectangle2: {...boundary, position:{x:boundary.position.x ,y:boundary.position.y+5}
                   }
                 }
               )
            ){moving =false ;break}
                
        }
    if(moving){
        movableitems.forEach(movable =>{
            movable.position.y+=5
        })}
    }
    else if (keys.s.pressed || touchdown) {
        players[socket.id].moving=true
        players[socket.id].image = players[socket.id].sprites.down
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: players[socket.id],
                rectangle2: {...boundary, position:{x:boundary.position.x ,y:boundary.position.y-5}
                   }
                 }
               )
            ){
                moving =false
                break
            }
                }
        if(moving){
        movableitems.forEach(movable =>{
            movable.position.y-=5
        })}
    }
    else if (keys.a.pressed|| touchleft===true) {
        players[socket.id].moving=true
        players[socket.id].image = players[socket.id].sprites.left
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: players[socket.id],
                rectangle2: {...boundary, position:{x:boundary.position.x+5,y:boundary.position.y}
                   }
                 }
               )
            ){
                moving =false
                break
            }
                }
        if(moving){
        movableitems.forEach(movable =>{
            movable.position.x+=5
        })}
    }
    else if (keys.d.pressed|| touchright===true) {
        players[socket.id].moving=true
        players[socket.id].image=players[socket.id].sprites.right
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: players[socket.id],
                rectangle2: {...boundary, position:{x:boundary.position.x-5 ,y:boundary.position.y}
                   }
                 }
               )
            ){
                moving =false
                break
            }
                }
        if(moving){
        movableitems.forEach(movable =>{
            movable.position.x-=5
        })}
    }
    
    
}

animate()

window.addEventListener('keydown', checkkeydown)
window.addEventListener('keyup',checkkeyup)



//----------//