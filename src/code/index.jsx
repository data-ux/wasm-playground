import React from 'react'
import ReactDOM from 'react-dom'
import AstNodeComponent from './AstNodeComponent'
import AstNode from './AstNode'

var stored = window.localStorage.getItem('ast')
var rootNode

if(stored){
    rootNode = AstNode.parse(stored)
}else{
    rootNode = new AstNode('module')
    rootNode.addChild( new AstNode('', rootNode) )
}
rootNode.setFrozen(true)

var RootComponent = React.createClass({
    handleNotify(){
        this.forceUpdate()
    },
    componentDidMount(){
        this.timer = setInterval( ()=>{
            var json = AstNode.stringify(this.props.root)
            window.localStorage.setItem('ast', json)
            console.log ('Saving to localStorage: ', json )
        } , 5000)
    },
    componentWillUnmount(){
        clearInterval(this.timer)
    },
    render(){
        return <AstNodeComponent node={this.props.root} notifyUp={this.handleNotify}/>
    }
})


ReactDOM.render(<RootComponent root={rootNode} />, document.getElementById('wastedit-main'))

