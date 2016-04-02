import React from 'react'
import ReactDOM from 'react-dom'

import functionParser from '../PEG/functionParser.pegjs'

import HeaderBar from './HeaderBar'
import EditorView from './EditorView'
import WasmJsConsole from './WasmJsConsole'
import AstNodeComponent from './AstNodeComponent'

import AstNode from './AstNode'
import astParser from './astParser'
import astPrinter from './astPrinter'
import astValidator from './astValidator'
import loadExamples from './loadExamples'
import analyzeExports from './analyzeExports'
import attachWasm from './attachWasm'
import delayTimer from './delayTimer'

require("../style/main.scss")


var App = React.createClass({
    getInitialState(){
        var initialExamples = [{name: 'add integer', code: '(module(func $add (param $x i32) (param $y i32) (result i32) (i32.add (get_local $x) (get_local $y)))(export "add" $add))'}]
        var rootNode =  astParser(initialExamples[0].code)
        rootNode.setFrozen(true)
        
        return {
            rootNode: rootNode,
            alert: "",
            color: "#008800",
            exports: null,
            output: {count : 0, msg: ""},
            examples: initialExamples,
            textFormat: 's-expression'
        }
    },
    componentDidMount() {
        loadExamples('examples/', (examples) => {
            this.setState({examples: examples})
        })
        attachWasm((compileFunc) => {
            this.compile = compileFunc
            this.doCompile()
            delayTimer.onActivate( () => {
                this.setState({alert: "Compiling module...", color: "#008800"})
            })
            delayTimer.onTimer( () => {
                this.doCompile()
            })
        })
    },
    doCompile(){
        var str = astPrinter(this.state.rootNode)
        var exports
        try {
            exports = this.compile(str)
        } catch (e) {
            console.log(e)
            exports = null
        }
        
        if(exports === null){
            this.setState({exports: exports, alert: "Syntax error. Failed to compile module.", color: "#880000"})
        }else{
            this.setState({exports: exports, alert: "Module valid. Available exports: " + analyzeExports(this.state.rootNode, exports), color: "#008800"})
        }
    },
    handleConsoleCommand(command){
        var parsed
        var exports = this.state.exports
        if(exports === null){
            this.setState({output: {count : this.state.output.count + 1, msg: "Error: No valid module"}})
            return
        }
        try{
            parsed = functionParser.parse(command)
        }catch(e){
            this.setState({output: {count : this.state.output.count + 1, msg: e.toString()}})
            return
        }
        
        var func = exports[parsed.functionName]
        if(!func){
            this.setState({output: {count : this.state.output.count + 1, msg: "Error: Unknown export function. Available exports: " + analyzeExports(this.state.rootNode, exports)}})
            return
        }
        
        var result
        try{
            result = func.apply(null, parsed.args)
        }catch(e){
            this.setState({output: {count : this.state.output.count + 1, msg: "Error: Called function threw exception"}})
            console.log(e)
            return
        }
        this.setState({output: {count : this.state.output.count + 1, msg: result}})
    },
    handleExampleChange(newExample){
        var match = this.state.examples.find(function(example){
            return example.name === newExample.name
        })
        if(!match) return
        
        var rootNode = astParser(match.code)
        rootNode.setFrozen(true)
        this.setState({rootNode: rootNode}, () => {this.doCompile()})
    },
    handleFormatChange(format){
        this.setState({textFormat: format.className})
    },
    render(){
        return (
            <div className="main-wrapper">
                <HeaderBar examples={this.state.examples} onExampleChange={this.handleExampleChange} onFormatChange={this.handleFormatChange}/>
                <EditorView root={this.state.rootNode} textFormat={this.state.textFormat} />
                <WasmJsConsole onCommand={this.handleConsoleCommand} output={this.state.output} alertText={this.state.alert} alertColor={this.state.color} />
            </div>
            )
    }
})

ReactDOM.render(<App />, document.getElementById('react-target'))