import React from 'react'
import measureText from './measureText'
import AstNodeComponent from './AstNodeComponent'
import AutoComplete from './AutoComplete'
import {astFilterOptionsPartial} from './astValidator'

var varName = /(^\$)|(^[0-9]+$)/

function generic(childCallback, selfNewline){
        var textWidth = measureText(this.state.editableText, this.props.node.children.length)
        var typeName = <input type='text' className={this.props.node.invalid ? 'invalid' : ''} ref='typeName' value={this.state.editableText} style={{width: Math.max(textWidth + 2, 10) + 'px'}} onFocus={this.handleFocus}
                onBlur={this.handleBlur} onChange={this.handleChange} onKeyDown={this.handleKeyDown} disabled={this.props.node.frozen} onPaste={this.handlePaste}/>
        
        var children
        if(childCallback){
            children = childCallback()
        }else{
            children = this.props.node.children.map((child) => {
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={this.props.node.frozen } textFormat={this.props.textFormat}/>
            })
        }
        var classes = ['ast-node']
        if(this.props.node.children.length){
            classes.push('has-children')
        }else{
            classes.push('no-children')
        }
        if(this.props.newline || selfNewline){
             classes.push('newline')
        }
        var auto
        var tentatives
        if(this.state.focused){
            tentatives = astFilterOptionsPartial(this.state.options, this.state.editableText)
            auto = <AutoComplete options={tentatives} tentative={this.state.tentative} onAutocompleteClick={this.handleAutocompleteClick} />
        }
        
        return <span className={classes.join(' ')}>{typeName}{auto}{children}</span>
}
function func(){
    return generic.call(this, () => {
        var inBlock = false
        return this.props.node.children.map((child, i) => {
                if(i > 0 && child.type !== 'param' && child.type !== 'result' && child.type !== ''){
                    inBlock = true
                }
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={inBlock} textFormat={this.props.textFormat}/>
            })
    })
}
function afterNames(){
    return generic.call(this, () => {
        var inBlock = false
        return this.props.node.children.map((child, i) => {
                if(!varName.test(child.type)){
                    inBlock = true
                }
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={inBlock} textFormat={this.props.textFormat}/>
            })
    }, true)
}
function tableswitch(){
    return generic.call(this, () => {
        var inBlock = false
        return this.props.node.children.map((child, i) => {
                if(child.type === 'table'){
                    inBlock = true;
                }
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={inBlock} textFormat={this.props.textFormat}/>
            })
    }, true)
}
function alwaysBlock(){
    return generic.call(this, () => {
        var inBlock = true
        return this.props.node.children.map((child, i) => {
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={inBlock} textFormat={this.props.textFormat}/>
            })
    })
}
function noChildrenFlat(){
    return generic.call(this, () => {
        var inBlock = this.props.node.children.some((child) => child.children.length)
        return this.props.node.children.map((child, i) => {
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={inBlock} textFormat={this.props.textFormat}/>
            })
    })
}
function afterFirst(){
    return generic.call(this, () => {
        return this.props.node.children.map((child, i) => {
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={i > 0} textFormat={this.props.textFormat}/>
            })
    })
}
var renderers = {
    "s-expression": {
        generic,
        func,
        block: afterNames,
        loop: afterNames,
        tableswitch
    },
    "indentation":{
        memory: afterNames,
        func: afterNames,
        loop: afterNames,
        set_local: afterFirst,
        get_local: afterFirst,
        generic: noChildrenFlat
    }
}

export default renderers