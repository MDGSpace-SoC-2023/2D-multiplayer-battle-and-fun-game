function rectangularcollision({rectangle1,rectangle2}){
    return(
        rectangle1.position.x + rectangle1.width>=rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y+ rectangle1.height/1.5 <=rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height/1.1>= rectangle2.position.y
    )
}

function checkkeydown(e){
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
    socket.emit('input',keys)
    
}

function checkkeyup(e){
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
    socket.emit('input',keys)

}


var touchstartx,touchstarty
function touchstart(e){
    touchstartx = e.touches[0].clientX
    touchstarty = e.touches[0].clientY
}

function touchend(){
    touchdown=false
    touchup= false
    touchleft=false
    touchright=false
}

function touchmove(e){
    var touchEndX = e.touches[0].clientX
    var touchEndY = e.touches[0].clientY
    if(touchEndX>touchstartx){
        if(touchEndX-touchstartx>Math.abs(touchEndY-touchstarty)){
            touchright=true
        }
        else{
            if(touchstarty>touchEndY){
              touchup =true
            }
            else{touchdown=true}
        }
    }
    else{
        if(Math.abs(touchEndX-touchstartx)>Math.abs(touchEndY-touchstarty)){
            touchleft=true
        }
        else{
            if(touchstarty>touchEndY){
                touchup =true
              }
              else{touchdown=true}
        }

    }

}
