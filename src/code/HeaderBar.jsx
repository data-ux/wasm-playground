import React from 'react'

import InfoPopup from './InfoPopup'

var HeaderBar = React.createClass({
    render(){
        return <div className="header-bar"><h1>ast.run</h1><h2>WebAssembly playground</h2><InfoPopup /></div>
    }
})

export default HeaderBar