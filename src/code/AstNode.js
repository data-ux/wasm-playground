export default class AstNode {
    constructor(type) {
        if(typeof type !== 'string'){
            type = ''
        }
        this.type = type
        this.children = []
    }
}