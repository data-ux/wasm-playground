import React from 'react'


var WasmJsConsole = React.createClass({
    getInitialState(){
        return {
            outputList: [],
            count: 0,
            history: [],
            historyPointer: 0
        }
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
        switch(e.key){
            case 'Enter':
                e.preventDefault()
                this.props.onCommand(this.refs.input.value)
                this.state.history.push(this.refs.input.value)
                if(this.state.history.length > 25){
                    this.state.history.splice(0, 5)
                }
                this.refs.input.value = ''
                this.setState({historyPointer: this.state.history.length})
                break
            case 'ArrowUp':
                e.preventDefault()
                if(this.state.historyPointer === 0 ){
                    break
                }
                this.setState(function(previousState, currentProps){return {historyPointer: previousState.historyPointer-1}})
                this.refs.input.value = this.state.history[this.state.historyPointer-1]
                break
            case 'ArrowDown':
                e.preventDefault()
                if(this.state.history.length === 0 || this.state.historyPointer >= this.state.history.length){
                    break
                }
                if(this.state.historyPointer === this.state.history.length-1){
                    this.refs.input.value = ''
                }else{
                    this.refs.input.value = this.state.history[this.state.historyPointer+1]
                }
                this.setState(function(previousState, currentProps){return {historyPointer: previousState.historyPointer+1}})
                break
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