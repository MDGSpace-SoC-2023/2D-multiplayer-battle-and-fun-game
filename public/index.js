const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io(`ws://localhost:3000`)

//===========Agora===========//
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
const localTracks={
    audioTrack : null
}

let isPlaying = true;

const remoteUsers = {};
window.remoteUsers = remoteUsers;

const buttonclicked = new Audio
buttonclicked.src = './data/buttonclicked.mp3'
const buttonreleased = new Audio
buttonreleased.src = './data/buttonreleased.wav'

const muteButton = document.getElementById("mute");
const uid = Math.floor(Math.random() * 1000000);

muteButton.addEventListener("click", () => {
  if (isPlaying) {
    buttonreleased.play()
    localTracks.audioTrack.setEnabled(false);
    muteButton.innerText = "unmute";
    socket.emit("mute", true);
  } else {
    buttonclicked.play()
    localTracks.audioTrack.setEnabled(true);
    muteButton.innerText = "mute";
    socket.emit("mute", false);
  }
  isPlaying = !isPlaying;
});

const options={
    appid: '9d20889cfe1449229d2057caff504c48',
    channel:'Game',
    uid,
    token:null
}

async function subscribe(user, mediaType) {
    await client.subscribe(user, mediaType);
    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  }
  
  function handleUserPublished(user, mediaType) {
    const id = user.uid;
    remoteUsers[id] = user;
    subscribe(user, mediaType);
  }
  
  function handleUserUnpublished(user) {
    const id = user.uid;
    delete remoteUsers[id];
  }
  
  async function join() {
    socket.emit("voiceId", uid);
  
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
  
    await client.join(options.appid, options.channel, options.token || null, uid);
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  
    await client.publish(Object.values(localTracks));
  }
  
  join();
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
const walksound = new Audio
walksound.src = './data/walksound.mp3'
const microphone = new Image()
microphone.src = './img/microphone.png'
//================================//




//=============Player sprite=============//


const players = []
let other =[]
const canvasx = canvas.width / 2 - (playerdownImage.width / 4) / 2
const canvasy = canvas.height / 2 - playerdownImage.height / 2
socket.on('updatePlayer', (backendPlayers) => {
    for (const id in backendPlayers) {
        const backendPlayer = backendPlayers[id];
        if (!players[id]) {
            players[id] = new Sprite({
                position: {
                     x: backendPlayer.xx,
                     y: backendPlayer.yy
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
                },
                spn : 2
            });
        
        }
        else {
            players[id].position.x = backendPlayer.xx;
            players[id].position.y = backendPlayer.yy;
            players[id].mute = backendPlayer.mute
            players[id].spn = backendPlayer.sprite
        }
    }
        
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
        x: offset.x ,
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

let touchup,touchdown,touchleft,touchright

window.addEventListener('touchstart',touchstart)
window.addEventListener('touchmove', touchmove)
window.addEventListener('touchend',touchend)



function animate(){
    c.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(animate)
    
    background.draw();
    for (const id in players) {
        const player = players[id];
        if(player.spn ==3){
            player.image=player.sprites.left
        }
        else if(player.spn ==4){
            player.image= player.sprites.right
        }
        else if(player.spn ==1){
            player.image= player.sprites.up
        }
        else if(player.spn ==2){
            player.image= player.sprites.down
        }
        player.draw();
        if(!players[id].mute){
            c.drawImage(microphone,players[id].position.x,players[id].position.y)
        }
    }
    
    // boundaries.forEach(boundary => {boundary.draw()})  //can we used to locate barrier blocks
    
    foreground.draw()
    let moving = true

    let player = players[socket.id]
    if(!player){return}
//==DEBUG=====//
// console.log(players[socket.id].width)
//============//
    walksound.pause()
    if (keys.w.pressed || touchup===true){
        
        players[socket.id].moving = true
        players[socket.id].image = players[socket.id].sprites.up
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: player,
                rectangle2: {...boundary, position:{x:boundary.position.x ,y:boundary.position.y+6}
                   }
                 }
               )
            ){moving =false;players[socket.id].moving=false ; break}
        }
    if(moving){
        players[socket.id].position.y-=4
        walksound.play()
        socket.emit('playerlocation',players[socket.id].position)
        socket.emit('playersprite','1')

    }
    
    }
    else if (keys.s.pressed || touchdown===true) {
        players[socket.id].moving=true
        players[socket.id].image = players[socket.id].sprites.down
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: players[socket.id],
                rectangle2: {...boundary, position:{x:boundary.position.x ,y:boundary.position.y-6}
                   }
                 }
               )
            ){
                moving =false;players[socket.id].moving=false ;
                break
            }
                }
        if(moving){
            players[socket.id].position.y+=4
            walksound.play()
            socket.emit('playerlocation',players[socket.id].position)
            socket.emit('playersprite','2')

    }
    }
    else if (keys.a.pressed|| touchleft===true) {
        players[socket.id].moving=true
        players[socket.id].image = players[socket.id].sprites.left
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: players[socket.id],
                rectangle2: {...boundary, position:{x:boundary.position.x+6,y:boundary.position.y}
                   }
                 }
               )
            ){
                moving =false;players[socket.id].moving=false ;
                break
            }
                }
        if(moving){
            players[socket.id].position.x-=4
            walksound.play()
            socket.emit('playerlocation',players[socket.id].position)
            socket.emit('playersprite','3')

        }
    }
    else if (keys.d.pressed|| touchright===true) {
        players[socket.id].moving=true
        players[socket.id].image=players[socket.id].sprites.right
        for(let i=0 ;i <boundaries.length;i++){
            const boundary = boundaries[i]
            if(rectangularcollision({
                rectangle1: players[socket.id],
                rectangle2: {...boundary, position:{x:boundary.position.x-6 ,y:boundary.position.y}
                   }
                 }
               )
            ){
                moving =false;players[socket.id].moving=false ;
                break
            }
                }
        
        if(moving){
            players[socket.id].position.x+=4
            walksound.play()
            socket.emit('playerlocation',players[socket.id].position)
            socket.emit('playersprite','4')


        }
    }
    
    
}

animate()

window.addEventListener('keydown', checkkeydown)
window.addEventListener('keyup',checkkeyup)



//----------//