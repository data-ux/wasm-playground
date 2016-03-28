import React from 'react'


var InfoPopup = React.createClass({
    getInitialState(){
        return {open: true}
    },
    handleClick(e){
        prevent(e)
        this.setState(function(previousState, currentProps){return {open: !previousState.open}})
    },
    render(){
        let popup = (
            <div className='info-popup'>
            <p className='intro'>
            <a href="http://webassembly.github.io/" target="_blank">WebAssembly</a> is the upcoming efficient low&#8209;level language for the web. 
            </p>
            <p>
            WebAssembly code forms an abstract syntax tree (AST), 
            represented here in textual S&#8209;expression format. You can edit the 
            AST and call the exported functions in the console below. 
            </p>
            <p>
            The editor enforces AST validity, i.e. you can only type names of nodes that can be used in a certain context.
            </p>
            <h3>Editor controls</h3>
            <table>
            <tbody>
            <tr><td><strong>Return:</strong></td><td> Add child to current node</td></tr>
            <tr><td><strong>Tab:</strong></td><td> Add new node after current node</td></tr>
            </tbody>
            </table>
            <div className='button-row'><p className='credits'>Created by Jan Wolski. Powered by <a href="https://github.com/WebAssembly/binaryen" target="_blank">binaryen</a>.</p><button onClick={this.handleClick} onMouseDown={prevent}>Got it!</button></div>
            </div>
            )
        return <div className="info-holder">{this.state.open ? popup : null}<button onClick={this.handleClick} onMouseDown={prevent} className={this.state.open?'active':''}>info</button></div>
    }
})

export default InfoPopup

function prevent(e){
    e.preventDefault()
    e.stopPropagation()
}