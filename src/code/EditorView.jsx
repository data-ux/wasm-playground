import React from 'react'

import AstNodeComponent from './AstNodeComponent'
import AstNode from './AstNode'

var EditorView = React.createClass({
    getInitialState() {
        return { root: this.props.root }
    },
    handleNotify() {
        this.forceUpdate()
    },
    componentDidMount() {
        this.timer = setInterval(() => {
            var json = AstNode.stringify(this.props.root)
            window.localStorage.setItem('ast', json)
            //console.log ('Saving to localStorage: ', json )
        }, 5000)/*
        AJAX('https://raw.githubusercontent.com/WebAssembly/spec/master/ml-proto/test/float_misc.wast', (response) => {
            var newRoot = astParser(response)
            newRoot.setFrozen(true)
            rootNode = newRoot
            this.setState({root: newRoot})
        })*/
    },
    componentWillUnmount() {
        clearInterval(this.timer)
    },
    render() {
        return <div className="editor-view"><AstNodeComponent node={this.state.root} notifyUp={this.handleNotify}/></div>
    }
})

function AJAX(url, success) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() { success(this.responseText) });
    oReq.open("GET", url);
    oReq.send();
}

export default EditorView