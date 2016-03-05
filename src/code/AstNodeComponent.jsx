import React from 'react'
import ReactDOM from 'react-dom'
import focus from './focus'
import measureText from './measureText'

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
                if(this.state.editable.trim().length === 0){
                    break
                }
                node.changeType(this.state.editable)
                node.branchOut()
                this.forceUpdate()
                break
            case 'Tab':
                e.preventDefault()
                if(this.state.editable.trim().length === 0){
                    break
                }
                node.changeType(this.state.editable)
                node.parent.addSiblingAfter(node)
                this.props.notifyUp()
                break
            case 'Backspace':
                if(this.state.editable.length === 0){
                    e.preventDefault()
                    this.remove()
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
                        if(!this.props.node.children.length && node.parent.parent && node.parent.isLastChild(node)){
                            if(this.state.editable.trim().length === 0){
                                this.remove()
                            }
                            node.parent.parent.addSiblingAfter(node.parent)
                            this.props.notifyUp(2)
                            break
                        }
                        focus.nextOfType(target)
                    }
                break
        }
    },
    remove(){
        var node = this.props.node;
        node.parent.removeChild(node)
        this.props.notifyUp(1)
        focus.previousOfType(this.refs.typeName)
    },
    handleBlur(){
        if(this.state.editable.trim().length === 0){
            this.remove()
        }
        var node = this.props.node;
        node.changeType(this.state.editable)
        this.forceUpdate()
    },
    componentDidMount(){
        this.refs.typeName && this.refs.typeName.focus()
    },
    handleNotify(generations){
        if(generations === 1){
            this.forceUpdate()
        }else{
            this.props.notifyUp(generations - 1)
        }
    },
    render(){
        var textWidth = measureText(this.state.editable, this.props.node.children.length)
        var typeName = <input type='text' ref='typeName' value={this.state.editable} style={{width: Math.max(textWidth + 4, 10) + 'px'}}
                onBlur={this.handleBlur} onChange={this.handleChange} onKeyDown={this.handleKeyDown} disabled={this.props.node.frozen}/>

        var children = this.props.node.children.map((child) => {
            return <AstNodeComponent key={child.id} node={child} notifyUp={this.handleNotify}/>
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