import React from 'react'
import ReactDOM from 'react-dom'
import AstNodeComponent from './AstNodeComponent'
import AstNode from './AstNode'

var rootNode = new AstNode('module')
rootNode.addChild( new AstNode('', rootNode) )
rootNode.setFrozen(true);

ReactDOM.render(<AstNodeComponent node={rootNode}/>, document.getElementById('wastedit-main'))
