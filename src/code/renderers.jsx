import React from 'react'
import measureText from './measureText'
import AstNodeComponent from './AstNodeComponent'
import AutoComplete from './AutoComplete'
import {astFilterOptionsPartial} from './astValidator'

var varName = /^\$/g

function generic(childCallback, selfNewline){
        var textWidth = measureText(this.state.editable, this.props.node.children.length)
        var typeName = <input type='text' ref='typeName' value={this.state.editable} style={{width: Math.max(textWidth + 2, 10) + 'px'}} onFocus={this.handleFocus}
                onBlur={this.handleBlur} onChange={this.handleChange} onKeyDown={this.handleKeyDown} disabled={this.props.node.frozen} onPaste={this.handlePaste}/>
        
        var children
        if(childCallback){
            children = childCallback()
        }else{
            children = this.props.node.children.map((child) => {
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={this.props.node.frozen}/>
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
            tentatives = astFilterOptionsPartial(this.state.options, this.state.editable)
            auto = <AutoComplete options={tentatives} tentative={this.state.tentative} />
        }
        
        return <span className={classes.join(' ')}>{typeName}{auto}{children}</span>
}
function func(){
    return generic.bind(this)( () => {
        var inBlock = false
        return this.props.node.children.map((child, i) => {
                if(i > 0 && child.type !== 'param' && child.type !== 'result' && child.type !== ''){
                    inBlock = true
                }
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={inBlock}/>
            })
    })
}
function afterNames(){
    return generic.bind(this)( () => {
        var inBlock = false
        return this.props.node.children.map((child, i) => {
                if(!varName.test(child.type)){
                    inBlock = true
                }
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={inBlock}/>
            })
    }, true)
}
function tableswitch(){
    return generic.bind(this)( () => {
        var inBlock = false
        return this.props.node.children.map((child, i) => {
                if(child.type === 'table'){
                    inBlock = true;
                }
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={inBlock}/>
            })
    }, true)
}
function alwaysBlock(){
    return generic.bind(this)( () => {
        var inBlock = true
        return this.props.node.children.map((child, i) => {
                return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify} newline={inBlock}/>
            })
    })
}
var renderers = {
    generic,
    func,
    block: afterNames,
    tableswitch
}

export default renderers