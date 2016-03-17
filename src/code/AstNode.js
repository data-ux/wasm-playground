var idBase = 0;

export default class AstNode {
    constructor(type, parent, children) {
        if(parent instanceof AstNode){
            this.parent = parent;
        }
        if(Array.isArray(children)){
            children.forEach( (child) => {
                if(!(child instanceof AstNode)) throw new TypeError('All children must be <AstNode>')
                child.parent = this
            })
            this.children = children
        }else{
            this.children = []
        }
        this.changeType(type)
        this.id = idBase++;
    }
    static stringify(node){
        if(!(node instanceof AstNode)){
            throw new TypeError('Can only serialize <AstNode>')
        }
        return JSON.stringify(node, function(key, value){
            if(Array.isArray(this)){
                if(!(value instanceof AstNode)) throw new TypeError('All children must be <AstNode>')
                return value
            }else{
                switch (key) {
                    case '':
                        return value
                    case 'type':
                        if(typeof value !== 'string') throw new TypeError('Field named "type" must be <String>')
                        return value
                    case 'children':
                        if(!Array.isArray(value)) throw new TypeError('Field named "children" must be <Array>')
                        return value.length > 0 ? value : undefined
                    default:
                        return undefined
                }
            }
        });
    }
    static parse(input){
        if(typeof input === 'string') {
            return JSON.parse(input, function(key, value){
                if(Array.isArray(this) || key === ''){
                    return new AstNode(value.type, null, value.children)
                }else{
                    switch (key) {
                        case 'type':
                            if(typeof value !== 'string') throw new TypeError('Field named "type" must be <String>')
                            return value
                        case 'children':
                            if(!Array.isArray(value)) throw new TypeError('Field named "children" must be <Array>')
                            return value
                        default:
                            return undefined
                    }
                }
            })
        }else{
            throw new TypeError('Can only parse JSON string')
        }
    }
    addChild(child){
        if(child instanceof AstNode){
            this.children.push(child)
        }
    }
    removeChild(child){
        if(this.frozen && this.children.length === 1){
            return
        }
        var index = this.children.indexOf(child)
        if(index >= 0){
            this.children.splice(index, 1)
        }
    }
    replaceChild(old, replacing){
        if(!(replacing instanceof AstNode)) throw new TypeError('Replacing child must be <AstNode>')
        var index = this.children.indexOf(old)
        if(index >= 0){
            replacing.parent = this
            this.children.splice(index, 1, replacing)
        }
    }
    changeType(type){
        if(typeof type !== 'string'){
            throw new TypeError('Node type must be <String>')
        }
        this.type = type
    }
    addChildAsFirst(){
            this.children.unshift( new AstNode('', this) )
    }
    addSiblingAfter(child){
        var index = this.children.indexOf(child)
        if(index >= 0){
            this.children.splice(index + 1, 0 , new AstNode('', this))
        }
    }
    setFrozen(bool){
        if(typeof bool !== 'boolean'){
            throw new TypeError('Frozen state must be <Boolean>')
        }
        this.frozen = bool;
    }
    isLastChild(child){
        var index = this.children.indexOf(child)
        if(index === this.children.length - 1){
            return true
        }else{
            return false
        }
    }
    isFirstChild(child){
        var index = this.children.indexOf(child)
        if(index === 0){
            return true
        }else{
            return false
        }
    }
}