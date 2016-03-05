import React from 'react'
import ReactDOM from 'react-dom'

export default React.createClass({
    getInitialState(){
        return {editable: this.props.node.type}
    },
    handleChange(e){
        this.setState({editable: e.target.value});
    },
    render(){
        return <span className='ast-node'><input type='text' size={Math.max(this.state.editable.length, 2)} value={this.state.editable} onChange={this.handleChange} /></span>
    }
});