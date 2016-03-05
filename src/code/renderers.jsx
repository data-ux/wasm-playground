import React from 'react'
import measureText from './measureText'
import AstNodeComponent from './AstNodeComponent'

function generic(childCallback){
        var textWidth = measureText(this.state.editable, this.props.node.children.length)
        var typeName = <input type='text' ref='typeName' value={this.state.editable} style={{width: Math.max(textWidth + 4, 10) + 'px'}}
                onBlur={this.handleBlur} onChange={this.handleChange} onKeyDown={this.handleKeyDown} disabled={this.props.node.frozen}/>
        
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
        if(this.props.newline){
             classes.push('newline')
        }
        return <span className={classes.join(' ')}>{typeName}{children}</span>
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
var renderers = {
    generic,
    func
}

export default renderers