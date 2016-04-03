import React from 'react'
import AstNodeComponent from './AstNodeComponent'
import AutoComplete from './AutoComplete'
import {astFilterOptionsPartial} from './astValidator'
import {getInfixRules} from './astValidator'

var varName = /(^\$)|(^[0-9]+$)/

function generic() {
    var type = this.props.node.type
    var inBlock = false
    var injectReturn = false
    var childGen = (child, i, array) => {
        if (!child) return
        var ret = (array && i === array.length-1 && injectReturn && child.type !== 'return')
        return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} injectReturn={ret} newline={this.props.node.frozen || inBlock} textFormat={this.props.textFormat}/>
    }
    var children = this.props.node.children.map(childGen)

    var classes = ['ast-node']
    if (this.props.newline) {
        classes.push('newline')
    }
    var prefix
    if (this.props.injectReturn) {
        prefix = 'return '
    }
    
    var typeName 
    if(varName.test(type) && (/^.et_local/).test(this.props.node.parent.type)){
        typeName = <span className="typeSpan">{type.replace(/^\$/, '')}</span>
    }else{
        typeName = <span className="typeSpan">{typeSubstitute(type)}</span>
    }
    
    
    if(infixTypes[type]){
        var useParens = infixTypes[this.props.node.parent.type]
        switch(type){
            case 'set_local':
                return <span className={classes.join(' ')}>{prefix}{useParens? '(': ''}${children[0]} {typeName} {children[1]}{useParens? ')': ''}</span>
            default:
                return <span className={classes.join(' ')}>{prefix}{useParens? '(': ''}{children[0]} {typeName} {children[1]}{useParens? ')': ''}</span>
        }
    }else{
            var name
            if(this.props.node.children.length && varName.test(this.props.node.children[0].type)){
                name = childGen(this.props.node.children[0])
            }
        switch(type){
            case 'module':
            case 'loop':
            case 'block':
            case 'memory':
                var i = 0
                var names = []
                while(varName.test(this.props.node.children[i].type)){
                    names.push(this.props.node.children[i])
                    i++
                }
                names = names.map(childGen)
                inBlock = true
                var rest = this.props.node.children.slice(i).map(childGen)
                return <span className={classes.join(' ')}>{prefix}{typeName}{names.length ? ' ': ''}{interleaveWith(names, ' ')}{' {'}{rest}{'}'}</span>
            case 'func':
                var params = this.props.node.children.filter( (child) => child.type === 'param').map(childGen)
                var commaParams = interleaveWith(params, ', ')
                var result = this.props.node.children.filter( (child) => child.type === 'result').map(childGen)
                inBlock = true
                injectReturn = true
                var rest = this.props.node.children.filter( (child) => !varName.test(child.type) && child.type !== 'param' && child.type !== 'result').map(childGen)
                return <span className={classes.join(' ')}>{prefix}{typeName} {name}({commaParams}){result}{' {'}{rest}{'}'}</span>
            case 'if':
                var test = children[0]
                var thenParens = this.props.node.children[1] && this.props.node.children[1].type !== 'block'
                var elseParens = this.props.node.children[2] && this.props.node.children[2].type !== 'block'
                inBlock = thenParens
                var thenBranch = childGen(this.props.node.children[1])
                inBlock = elseParens
                var elseBranch = childGen(this.props.node.children[2])
                return <span className={classes.join(' ')}>{prefix}{typeName} ({test}) {thenParens?'{':''}{thenBranch}{thenParens?'}':''}{elseBranch ? ' else ': ''}{elseParens?'{':''}{elseBranch}{elseParens?'}':''}</span>
            case 'select':
                var test = childGen(this.props.node.children[2])
                var thenBranch = childGen(this.props.node.children[0])
                var elseBranch = childGen(this.props.node.children[1])
                return <span className={classes.join(' ')}>{prefix}({test} ? {thenBranch} : {elseBranch})</span>
            case 'local':
                var inLocal = true
            case 'param':
                if(name){
                    return <span className={classes.join(' ')}>{prefix}{typeName}{inLocal?' ':''}{name}: {childGen(this.props.node.children[1])}</span>
                }else{
                    var commaTypes = []
                    children.forEach( (child, i) => {
                        if(inLocal){
                            commaTypes.push(<span key={'local'+i}>${i} = {child}</span>)
                        }else{
                            commaTypes.push(child)
                        }
                        if(i < children.length-1) commaTypes.push(', ')
                    })
                    return <span className={classes.join(' ')}>{prefix}{typeName} {commaTypes}</span>
                }
            case 'get_local':
                return <span className={classes.join(' ')}>{prefix}{typeName}${children}</span>
            default:
                return <span className={classes.join(' ')}>{prefix}{typeName}{children.length ? ' ': ''}{interleaveWith(children, ' ')}</span>
        }
    }
}

export default generic

function interleaveWith(array, thing){
    var output = []
    array.forEach( (element, i) => {
        output.push(element)
        if(i < array.length - 1) output.push(thing)
    })
    return output
}

let infixTypes = {}
getInfixRules().forEach( (rule) => infixTypes[rule.name] = true)
infixTypes['set_local'] = true

var directSubstitution = {
    'func': 'function',
    'param': '',
    'get_local': '',
    'set_local': '=',
    'result': ':',
    'local': 'var',
    'br': 'break',
    'block': ''
}

var patterns = [
    {rex: /^([^.]*\.)add/, substitution: '+'},
    {rex: /^([^.]*\.)sub/, substitution: '-'},
    {rex: /^([^.]*\.)mul/, substitution: '*'},
    {rex: /^([^.]*\.)div/, substitution: '/'},
    {rex: /^([^.]*\.)eq/, substitution: '=='},
    {rex: /^([^.]*\.)ne/, substitution: '!='},
    {rex: /^([^.]*\.)lt/, substitution: '<'},
    {rex: /^([^.]*\.)le/, substitution: '<='},
    {rex: /^([^.]*\.)gt/, substitution: '>'},
    {rex: /^([^.]*\.)ge/, substitution: '>='},
    {rex: /^([^.]*\.)and$/, substitution: '&&'},
    {rex: /^([^.]*\.)or$/, substitution: '||'},
    {rex: /^([^.]*\.)const/, substitution: ''}
]

function typeSubstitute(type){
    var match = directSubstitution[type]
    if(typeof match === 'string') return match
    match = patterns.find((pattern) => {
        return pattern.rex.test(type)
    })
    if(!match) return type
    return match.substitution
}