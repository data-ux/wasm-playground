import React from 'react'

import AstNodeComponent from './AstNodeComponent'
import AstNode from './AstNode'

var EditorView = React.createClass({
    handleNotify() {
        this.forceUpdate()
    },
    handleClear(){
        this.props.root.children = []
        this.props.root.addChild(new AstNode('', this.props.root))
        AstNodeComponent.focusNextCreated()
        this.forceUpdate()
    },
    render() {
        var message
        if(this.props.textFormat === 'c-like'){
            message = (<div className="editor-message"><span>Editing disabled with this text format</span></div>)
        }
        return (
        <div className={"editor-view " + this.props.textFormat}>
            <div className='scroll-area'>
                <AstNodeComponent node={this.props.root} notifyUp={this.handleNotify} textFormat={this.props.textFormat}/>
            </div>
            <ClearButton onClear={this.handleClear}/>
            {message}
        </div>
        )
    }
})

export default EditorView


var ClearButton = React.createClass({
    handleClick(e){
        e.stopPropagation();
        this.props.onClear();
    },
    render(){
        return (<div className='clear-button' onClick={this.handleClick}>&times;</div>)
    }
})