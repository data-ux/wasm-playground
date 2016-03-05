var focus = {
    nextOfType(DomElement) {
        doFocus(DomElement, 1)
    },
    previousOfType(DomElement) {
        doFocus(DomElement, -1)
    }
}

function doFocus(DomElement, delta) {
    var nodeList = document.getElementsByTagName(DomElement.tagName)
    var elements = Array.prototype.slice.call(nodeList)
    var index = elements.indexOf(DomElement) + delta
    if(index < 0 || index >= elements.length){
        return
    }
    elements[index].focus();
}


export default focus