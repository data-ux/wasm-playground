import React from 'react'


var DropdownMenu = React.createClass({
    getInitialState(){
        return {selected: this.props.options[0]}
    },
    handleChange(e){
        var newSelection = this.props.options.find( (option) => {
            return option.name === e.target.value
        })
        if(!newSelection) return
        this.setState({selected: newSelection})
        this.props.onSelect(newSelection)
    },
    render(){
        var options = this.props.options.map( (example) => {
            return (<option key={example.name} value={example.name}>{example.name}</option>)
        })
        return (
        <div className="menu-holder">
        <label className="menu-label">{this.props.label}</label>
            <select value={this.state.selected.name} onChange={this.handleChange}>
                {options}
            </select>
        </div>
        )
    }
})

export default DropdownMenu

function prevent(e){
    e.preventDefault()
    e.stopPropagation()
}