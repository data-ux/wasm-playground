import React from 'react'


var ExamplesMenu = React.createClass({
    getInitialState(){
        return {selected: this.props.examples[0].name}
    },
    handleChange(e){
        this.setState({selected: e.target.value})
        this.props.onSelect(e.target.value)
    },
    render(){
        var options = this.props.examples.map( (example) => {
            return (<option key={example.name} value={example.name}>{example.name}</option>)
        })
        return (
        <div className="example-holder">
            <select value={this.state.selected} onChange={this.handleChange}>
                {options}
            </select>
        </div>
        )
    }
})

export default ExamplesMenu

function prevent(e){
    e.preventDefault()
    e.stopPropagation()
}