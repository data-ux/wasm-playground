import AstNode from './AstNode'

var parts
function astPrinter(node){
    parts = []
    
    printNode(node)
    
    return parts.join('')
}

function printNode(node) {
    var hasChildren = !!node.children.length
    if(hasChildren){
        parts.push(" (")
    }else{
        parts.push(" ")
    }
    parts.push(node.type)
    
    node.children.forEach(function(child){
        printNode(child)
    })
    
    if(hasChildren){
        parts.push(")")
    }
}
export default astPrinter