import React from 'react'

var AutoComplete = React.createClass({
    render(){
        var rows = this.props.options
            .filter( (option) => {
                return option.substr(0, this.props.current.length) === this.props.current
            })
            .map( (option) => {
                return <div className={this.props.tentative === option ? 'active' : ''}>{option}</div>
            })
        return (
        <div className="auto-complete-holder">
            <div className="auto-complete-list">
                {rows}
            </div>
        </div>
        )
    }
})

export default AutoComplete