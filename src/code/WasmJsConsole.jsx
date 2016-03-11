import React from 'react'


var WasmJsConsole = React.createClass({
    getInitialState(){
        return {outputList: []}
    },
    componentWillReceiveProps(nextProps){
      if(nextProps.output.count > this.state.outputList.length){
          this.state.outputList.push(nextProps.output.msg)
          this.setState({outputList: this.state.outputList})
      }  
    },
    cancelClick(){
        this.dragged = true;
    },
    mouseDown(){
        this.dragged = false;
    },
    mouseUp(){
        if(!this.dragged){
            this.refs.input.focus()
        }
    },
    handleKeyDown: function(e){
        var target = e.target
        if(e.key === 'Enter'){
            e.preventDefault()
            //TODO validate
            this.props.onCommand(this.refs.input.value)
            this.refs.input.value = ""
        }
    },
    render(){
        var rows = this.state.outputList.map(function(row, i){
            return <div key={i}>{row}</div>
        })
        return (
        <div className="wasmjs-console" onMouseMove={this.cancelClick} onMouseDown={this.mouseDown} onMouseUp={this.mouseUp}>
            <div className="alert-area" style={{color: this.props.alertColor}}>{this.props.alertText}</div>
            <div className="console-output"><div className="output-inner">{rows}</div></div>
            <div type="text" className="console-input">
                <input ref="input" onKeyDown={this.handleKeyDown} className="console-input-element" type="text" />
            </div>
        </div>
        )
    }
})

export default WasmJsConsole