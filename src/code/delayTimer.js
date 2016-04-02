var timerCallback = function(){}
var activateCallback = function(){}
var timer = null

function activateDelay(){
    clearTimeout(timer)
    timer = setTimeout(timerCallback, 2000)
    activateCallback()
}

function onTimer(cb){
    timerCallback = cb
}

function onActivate(cb){
    activateCallback = cb
}


var delayTimer = {
    activateDelay,
    onTimer,
    onActivate
}


export default delayTimer