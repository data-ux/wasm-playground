import React from 'react'

import astPrinter from './astPrinter'

var SaveButton = React.createClass({
    handleClick(e){
        var codeStr = astPrinter(this.props.node)
        location.href = "data:application/octet-stream," + encodeURIComponent(codeStr);
    },
    render(){
        return <div className="copy-button-holder"><button className="copy-button" onClick={this.handleClick}>Download as file</button></div>
    }
})

export default SaveButton;