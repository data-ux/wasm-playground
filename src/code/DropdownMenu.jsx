import React from 'react'


var DropdownMenu = React.createClass({
    getInitialState(){
        return {selected: this.props.options[0].name}
    },
    handleChange(e){
        this.setState({selected: e.target.value})
        this.props.onSelect(e.target.value)
    },
    render(){
        var options = this.props.options.map( (example) => {
            return (<option key={example.name} value={example.name}>{example.name}</option>)
        })
        return (
        <div className="menu-holder">
            <select value={this.state.selected} onChange={this.handleChange}>
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