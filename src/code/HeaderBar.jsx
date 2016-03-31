import React from 'react'

import InfoPopup from './InfoPopup'
import DropdownMenu from './DropdownMenu'

var HeaderBar = React.createClass({
    render(){
        return (
        <div className="header-bar">
            <h1>ast.run</h1><h2>WebAssembly playground</h2>
            <div className="header-ui">
                <DropdownMenu options={this.props.examples} onSelect={this.props.onExampleChange}/>
                <DropdownMenu options={formats} onSelect={this.props.onFormatChange}/>
                <InfoPopup />
            </div>
        </div>
        )
    }
})

var formats = [
    {name: 's-expression'},
    {name: 'indentation'}
]

export default HeaderBar