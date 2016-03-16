import React from 'react'

var AutoComplete = React.createClass({
    render(){
        var rows = this.props.options
            .map( (option) => {
                return <div key={option} className={this.props.tentative === option ? 'active' : ''}>{option}</div>
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