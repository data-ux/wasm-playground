var focus = {
    nextOfType(DomElement) {
        doFocus(DomElement, 1)
    },
    previousOfType(DomElement) {
        doFocus(DomElement, -1)
    }
}

function doFocus(DomElement, delta) {
    var nodeList = document.querySelectorAll(DomElement.tagName + ':not(:disabled)')
    var elements = Array.prototype.slice.call(nodeList)
    var index = elements.indexOf(DomElement) + delta
    if(index < 0 || index >= elements.length-1){
        return
    }
    if(DomElement.tagName === 'input' || DomElement.tagName === 'INPUT'){
        if(delta > 0){
            elements[index].setSelectionRange(0, 0)
        }else{
            let len = elements[index].value.length
            elements[index].setSelectionRange(len, len)
        }
    }
    elements[index].focus();
}


export default focus