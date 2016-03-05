var idBase = 0;

export default class AstNode {
    constructor(type, parent) {
        if(parent instanceof AstNode){
            this.parent = parent;
        }
        this.changeType(type)
        this.children = []
        this.id = idBase++;
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
    changeType(type){
        if(typeof type !== 'string'){
            throw new TypeError('Node type must be <String>')
        }
        this.type = type
    }
    branchOut(){
        if(!this.children.length){
            this.children.push( new AstNode('', this) )
        }
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
}