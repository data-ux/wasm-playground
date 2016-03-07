import AstNode from './AstNode'

var tokenizer = /(;;[^\n]*)|("[^"]*")|(\()|(\))|([^\s\(\)]+)/g;
var commentRex = /^;;/

var tokens

function astParser(str){
    tokens = new TokenList()
    var incoming
    
    while(incoming = tokenizer.exec(str)){
        if(commentRex.test(incoming[0])) continue // filter out comments
        tokens.addToken(incoming[0])
    }
    var first = tokens.next()
    
    if(first !== '(' || first === null) throw new SyntaxError('AST parse error: string must start with "("')
    return parseNode()
}

function parseNode(parent){
    var type = tokens.next()
    if(type === '(') throw new SyntaxError('AST parse error: node must have name')
    
    var current = new AstNode(type, parent)
    var incoming
    while(( incoming = tokens.next() ) !== ')'){
        if(incoming === null) throw new SyntaxError('AST parse error: unexpected end of input')
        if(incoming === '('){
            current.addChild( parseNode(current) )
        }else{
            current.addChild(new AstNode(incoming, current))
        }
    }
    return current
}

class TokenList{
    constructor(){
        this.tokens = []
        this.index = 0
    }
    addToken(token){
        this.tokens.push(token)
    }
    next(){
        if(this.index < this.tokens.length){
            return this.tokens[this.index++]
        }else{
            this.index = 0
            return null
        }
    }
}

export default astParser