import React from 'react'
import ReactDOM from 'react-dom'
import AstNodeComponent from './AstNodeComponent'
import AstNode from './AstNode'

var rootNode = new AstNode('module')

ReactDOM.render(<AstNodeComponent node={rootNode} />, document.getElementById('wastedit-main'))
