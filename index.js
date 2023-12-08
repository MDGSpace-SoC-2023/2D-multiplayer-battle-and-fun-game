const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

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

const offset = {x: -810,y : -900}//Offset to the map

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
image.src = './img/ok.png'
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

//=============PLyer sprite=============//
const player = new Sprite({
    position:{
        x: canvas.width / 2 - (playerdownImage.width / 4) / 2,
        y: canvas.height / 2 - playerdownImage.height / 2
    },
    image : playerdownImage,
    frames:{
        max:4
    },
    sprites :{
        up:playerupImage,
        left : playerleftImage,
        down : playerdownImage,
        right : playerrightImage,
    }
})

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


function animate() {
    window.requestAnimationFrame(animate)
    background.draw()
    // boundaries.forEach(boundary => {boundary.draw()})  //can we used to locate barrier blocks
    player.draw()
    foreground.draw()

    let moving = true
    player.moving =false


    if (keys.w.pressed) {
        player.moving = true
        player.image = player.sprites.up
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: player,
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
    else if (keys.s.pressed) {
        player.moving=true
        player.image = player.sprites.down
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: player,
                rectangle2: {...boundary, position:{x:boundary.position.x ,y:boundary.position.y-5}
                   }
                 }
               )
            ){
                console.log('collide')
                moving =false
                break
            }
                }
        if(moving){
        movableitems.forEach(movable =>{
            movable.position.y-=5
        })}
    }
    else if (keys.a.pressed) {
        player.moving=true
        player.image = player.sprites.left
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: player,
                rectangle2: {...boundary, position:{x:boundary.position.x+5 ,y:boundary.position.y}
                   }
                 }
               )
            ){
                console.log('collide')
                moving =false
                break
            }
                }
        if(moving){
        movableitems.forEach(movable =>{
            movable.position.x+=5
        })}
    }
    else if (keys.d.pressed) {
        player.moving=true
        player.image=player.sprites.right
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: player,
                rectangle2: {...boundary, position:{x:boundary.position.x-5 ,y:boundary.position.y}
                   }
                 }
               )
            ){
                console.log('collide')
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
window.addEventListener('keydown', (e) => {
    // e= event
    switch (e.key.toLowerCase()) {
        case 'w':
            keys.w.pressed = true
            break
        case 'a':
            keys.a.pressed = true
            break
        case 's':
            keys.s.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
    }
}
)

window.addEventListener('keyup', (e) => {
    // e= event
    switch (e.key.toLowerCase()) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
}
)



//----------//
