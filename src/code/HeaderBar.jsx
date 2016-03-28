import React from 'react'

import InfoPopup from './InfoPopup'
import ExamplesMenu from './ExamplesMenu'

var HeaderBar = React.createClass({
    render(){
        return (
        <div className="header-bar">
            <h1>ast.run</h1><h2>WebAssembly playground</h2>
            <div className="header-ui"><ExamplesMenu examples={this.props.examples} onSelect={this.props.onExampleChange}/><InfoPopup /></div>
        </div>
        )
    }
})

export default HeaderBar