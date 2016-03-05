import React from 'react'
import ReactDOM from 'react-dom'
import AstNodeComponent from './AstNodeComponent'
import AstNode from './AstNode'

var rootNode = new AstNode('module')
rootNode.addChild( new AstNode('', rootNode) )
rootNode.setFrozen(true)

var RootComponent = React.createClass({
    handleNotify(){
        this.forceUpdate()
    },
    render(){
        return <AstNodeComponent node={this.props.root} notifyUp={this.handleNotify}/>
    }
})


ReactDOM.render(<RootComponent root={rootNode} />, document.getElementById('wastedit-main'))
