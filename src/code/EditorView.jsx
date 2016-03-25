import React from 'react'

import AstNodeComponent from './AstNodeComponent'
import AstNode from './AstNode'

var EditorView = React.createClass({
    handleNotify() {
        this.forceUpdate()
    },
    componentDidMount() {
        this.timer = setInterval(() => {
            var json = AstNode.stringify(this.props.root)
            window.localStorage.setItem('ast', json)
            //console.log ('Saving to localStorage: ', json )
        }, 5000)
    },
    componentWillUnmount() {
        clearInterval(this.timer)
    },
    handleClear(){
        this.props.root.children = []
        this.props.root.addChild(new AstNode('', this.props.root))
        this.forceUpdate();
    },
    render() {
        return <div className="editor-view"><AstNodeComponent node={this.props.root} notifyUp={this.handleNotify}/><ClearButton onClear={this.handleClear}/></div>
    }
})

function AJAX(url, success) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() { success(this.responseText) });
    oReq.open("GET", url);
    oReq.send();
}

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