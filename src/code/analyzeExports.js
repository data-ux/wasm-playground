export default function analyzeExports(root){

    var exportNames = root.children
        .filter( (c) => c.type === "export")
        .map(function(child){
            return {name: child.children[0].type.replace(/["]+/g, ''), funcName: child.children[1].type}
    })

    var funcs = root.children
        .filter( (c) => c.type === "func")
        .map(function(child){
            return {name: child.children[0].type, func: child}
    })

    var validFuncs = exportNames.map(function(ex){
        var targetFunc = funcs.find(function(func){
            return func.name === ex.funcName
        })
        if(targetFunc){
            targetFunc.exportName = ex.name
        }
        return targetFunc
        
    }).filter( (o) => o )

    return validFuncs.map(function(e){
        var params = []
        e.func.children.filter(function(child){
            return child.type === "param" && child.children.length > 0
        }).forEach(function(child){
            if(child.children[0].type.substr(0,1) === '$'){
                params.push(child.children[child.children.length-1].type)
            }else{
                child.children.forEach( (child) => {params.push(child.type)})
            }
        })
        return e.exportName + "(" + params.join(", ") + ")"
    }).join(", ")
     
}