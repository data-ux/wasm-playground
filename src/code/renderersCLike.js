import React from 'react'
import AstNodeComponent from './AstNodeComponent'
import AutoComplete from './AutoComplete'
import {astFilterOptionsPartial} from './astValidator'
import {getInfixRules} from './astValidator'

var varName = /(^\$)|(^[0-9]+$)/

function generic() {
    var type = this.props.node.type
    var inBlock = false
    var childGen = (child) => {
        if (!child) return
        return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={this.props.node.frozen || inBlock} textFormat={this.props.textFormat}/>
    }
    var children = this.props.node.children.map(childGen)

    var classes = ['ast-node']
    if (this.props.newline) {
             classes.push('newline')
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
                    return <span className={classes.join(' ')}>{useParens? '(': ''}${children[0]} {typeName} {children[1]}{useParens? ')': ''}</span>
                default:
                    return <span className={classes.join(' ')}>{useParens? '(': ''}{children[0]} {typeName} {children[1]}{useParens? ')': ''}</span>
            }
        }else{
                var name
                if(this.props.node.children.length && varName.test(this.props.node.children[0].type)){
                    name = this.props.node.children[0].type
                }
            switch(type){
                case 'module':
                case 'loop':
                case 'block':
                    var i = 0
                    var names = []
                    while(varName.test(this.props.node.children[i].type)){
                        names.push(this.props.node.children[i])
                        i++
                    }
                    names = names.map(childGen)
                    inBlock = true
                    var rest = this.props.node.children.slice(i).map(childGen)
                    return <span className={classes.join(' ')}>{typeName}{names.length ? ' ': ''}{interleaveWith(names, ' ')}{' {'}{rest}{'}'}</span>
                case 'func':
                    var params = this.props.node.children.filter( (child) => child.type === 'param').map(childGen)
                    var commaParams = interleaveWith(params, ', ')
                    var result = this.props.node.children.filter( (child) => child.type === 'result').map(childGen)
                    inBlock = true
                    var rest = this.props.node.children.filter( (child) => !varName.test(child.type) && child.type !== 'param' && child.type !== 'result').map(childGen)
                    return <span className={classes.join(' ')}>{typeName} {name}({commaParams}){result}{' {'}{rest}{'}'}</span>
                case 'local':
                    var inLocal = true
                case 'param':
                    if(name){
                        return <span className={classes.join(' ')}>{typeName} {name}: {childGen(this.props.node.children[1])}</span>
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
                        return <span className={classes.join(' ')}>{typeName} {commaTypes}</span>
                    }
                case 'get_local':
                    return <span className={classes.join(' ')}>{typeName} ${children}</span>
                default:
                    return <span className={classes.join(' ')}>{typeName}{children.length ? ' ': ''}{interleaveWith(children, ' ')}</span>
            }
        }
}

var renderers = {
    generic
}

function interleaveWith(array, thing){
    var output = []
    array.forEach( (element, i) => {
        output.push(element)
        if(i < array.length - 1) output.push(thing)
    })
    return output
}

export default renderers

let infixTypes = {}
getInfixRules().forEach( (rule) => infixTypes[rule.name] = true)
infixTypes['set_local'] = true

var transforms = [
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
    {rex: /^([^.]*\.)const/, substitution: ''},
    {rex: /^func$/, substitution: 'function'},
    {rex: /^param$/, substitution: ''},
    {rex: /^get_local$/, substitution: ''},
    {rex: /^result$/, substitution: ': '},
    {rex: /^local$/, substitution: 'var'},
    {rex: /^set_local$/, substitution: '='},
]

function typeSubstitute(type){
    var match = transforms.find((transform) => {
        return transform.rex.test(type)
    })
    if(!match) return type
    return match.substitution
}