import React from 'react'
import ReactDOM from 'react-dom'
import AstNodeComponent from './AstNodeComponent'
import AstNode from './AstNode'
import astParser from './astParser'

var stored //= window.localStorage.getItem('ast')
var rootNode

if(stored){
    rootNode = AstNode.parse(stored)
}else{
    rootNode = new AstNode('module')
    rootNode.addChild( new AstNode('', rootNode) )
}
rootNode.setFrozen(true)

var RootComponent = React.createClass({
    getInitialState(){
        return {root: this.props.root}
    },
    handleNotify(){
        this.forceUpdate()
    },
    componentDidMount(){
       /* this.timer = setInterval( ()=>{
            var json = AstNode.stringify(this.props.root)
            window.localStorage.setItem('ast', json)
            console.log ('Saving to localStorage: ', json )
        } , 5000)*/
        AJAX('https://raw.githubusercontent.com/WebAssembly/spec/master/ml-proto/test/switch.wast', (response) => {
            var newRoot = astParser(response)
            newRoot.setFrozen(true)
            this.setState({root: newRoot})
        })
    },
    componentWillUnmount(){
        clearInterval(this.timer)
    },
    render(){
        return <AstNodeComponent node={this.state.root} notifyUp={this.handleNotify}/>
    }
})


ReactDOM.render(<RootComponent root={rootNode} />, document.getElementById('wastedit-main'))

function AJAX(url, success) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function(){success(this.responseText)});
    oReq.open("GET", url);
    oReq.send();
}
