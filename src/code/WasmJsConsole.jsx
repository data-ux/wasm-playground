import React from 'react'


var WasmJsConsole = React.createClass({
    getInitialState(){
        return {outputList: [], count: 0}
    },
    componentWillReceiveProps(nextProps){
      if(nextProps.output.count > this.state.count){
          this.state.outputList.push(nextProps.output.msg)
          if(this.state.outputList.length > 20){
              this.state.outputList.shift();
          }
          this.setState({outputList: this.state.outputList, count: this.state.count + 1})
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