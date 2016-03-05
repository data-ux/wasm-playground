import React from 'react'
import ReactDOM from 'react-dom'
import focus from './focus'

 var AstNodeComponent = React.createClass({
    getInitialState(){
        return {editable: this.props.node.type}
    },
    handleChange(e){
        this.setState({editable: e.target.value})
    },
    handleKeyDown: function(e){
        var node = this.props.node;
        var target = e.target
        switch(e.key){
            case 'Enter':
                e.preventDefault()
                if(this.state.editable.length <= 1){
                    break
                }
                node.changeType(this.state.editable)
                node.branchOut()
                this.forceUpdate()
                break
            case 'Tab':
                e.preventDefault()
                node.changeType(this.state.editable)
                node.parent.addSiblingAfter(node)
                this.props.notifyUp()
                break
            case 'Backspace':
                if(this.state.editable.length === 0){
                    e.preventDefault()
                    node.parent.removeChild(node)
                    this.props.notifyUp()
                    focus.previousOfType(target)
                }
                break
            case 'ArrowLeft':
                    if(target.selectionStart === 0 && target.selectionEnd === 0){
                        e.preventDefault()
                        focus.previousOfType(target)
                    }
                break
            case 'ArrowRight':
                    if(target.selectionStart === this.state.editable.length && target.selectionEnd === this.state.editable.length){
                        e.preventDefault()
                        focus.nextOfType(target)
                    }
                break
        }
    },
    handleBlur(){
        var node = this.props.node;
        node.changeType(this.state.editable)
        this.forceUpdate()
    },
    componentDidMount(){
        this.refs.typeName && this.refs.typeName.focus()
    },
    render(){
        var typeName = <input type='text' ref='typeName' size={Math.max(this.state.editable.length+1, 2)} value={this.state.editable}
                onBlur={this.handleBlur} onChange={this.handleChange} onKeyDown={this.handleKeyDown} disabled={this.props.node.frozen}/>

        var children = this.props.node.children.map((child) => {
            return <AstNodeComponent key={child.id} node={child} notifyUp={this.forceUpdate.bind(this)}/>
        });
        var classes = ['ast-node']
        if(this.props.node.children.length){
            classes.push('has-children')
        }else{
            classes.push('no-children')
        }
        if(this.props.node.frozen || this.props.node.type === 'func'){
             classes.push('multiline')
        }
        if(this.props.node.type === 'func'){
             classes.push('func')
        }
        return <span className={classes.join(' ')}>{typeName}{children}</span>
    }
});

export default AstNodeComponent