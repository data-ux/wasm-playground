var callback = function(){}
var timer = null

function activateDelay(){
    clearTimeout(timer)
    timer = setTimeout(callback, 2000)
}

function onTimer(cb){
    callback = cb
}


var delayTimer = {
    activateDelay,
    onTimer
}


export default delayTimer