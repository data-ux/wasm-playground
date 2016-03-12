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

var stored = window.localStorage.getItem('ast')
var rootNode

if (stored) {
    rootNode = AstNode.parse(stored)
} else {
    rootNode = new AstNode('module')
    rootNode.addChild(new AstNode('', rootNode))
}
rootNode.setFrozen(true)

var exports = {}
setInterval(() => {
            exports = window.compile()
            console.log ('compiling...')
        }, 5000)


//App component
var App = React.createClass({
    getInitialState(){
        return {
            alert: "Compiler ready",
            color: "#008800",
            exports: {},
            output: {count : 0, msg: ""}
        }
    },
    handleConsoleCommand(command){
        var parsed
        
        try{
            parsed = functionParser.parse(command)
        }catch(e){
            this.setState({output: {count : this.state.output.count + 1, msg: e.toString()}})
            return
        }
        console.log(parsed)
        
        var func = exports[parsed.functionName]
        if(!func){
            this.setState({output: {count : this.state.output.count + 1, msg: "Unknown export function"}})
            return
        }
        var result = func.apply(null, parsed.args)
        this.setState({output: {count : this.state.output.count + 1, msg: result}})
    },
    render(){
        return (
            <div className="main-wrapper">
                <HeaderBar />
                <EditorView root={rootNode} />
                <WasmJsConsole onCommand={this.handleConsoleCommand} output={this.state.output} alertText={this.state.alert} alertColor={this.state.color} />
            </div>
            )
    }
})

ReactDOM.render(<App />, document.getElementById('react-target'))



// WASM.js integration

var wasmjsTag = document.createElement('script')

document.body.appendChild(wasmjsTag)

wasmjsTag.onload = function() {
    window.loadWasm = function(code, lookupImport) {
        try {
            var module = WasmJS()
            module.outside = {}
            if (typeof lookupImport === 'function') {
                module.lookupImport = lookupImport
            } else {
                module.lookupImport = function(a, b) {
                    return function() { console.log('called import "' + a + " " + b + '" with arguments: ' + Array.prototype.slice.call(arguments)) }
                }
            }
            module['providedTotalMemory'] = module['buffer'].byteLength;

            module['reallocBuffer'] = function(size) {
                var old = module['buffer'];
                module['asmExports']['__growWasmMemory'](size); // tiny wasm method that just does grow_memory
                console.log('grow_memory: ', size)
                return module['buffer'] !== old ? module['buffer'] : null; // if it was reallocated, it changed
            }
            var asm2wasmImports = { // special asm2wasm imports
                "f64-rem": function(x, y) {
                    return x % y;
                },
                "f64-to-int": function(x) {
                    return x | 0;
                },
                "debugger": function() {
                    debugger;
                }
            }
            module['info'] = {
                global: null,
                env: null,
                asm2wasm: asm2wasmImports,
                parent: module // Module inside wasm-js.cpp refers to wasm-js.cpp; this allows access to the outside program.
            }
            var temp = module['_malloc'](code.length + 1)
            module['writeAsciiToMemory'](code, temp)
            module['_load_s_expr2wasm'](temp)
            module['_free'](temp)
            module['_instantiate'](temp)
        } catch (e) {
            console.log(e)
            return null
        }

        return module['asmExports']
    }
    window.compile = function() {
        var str = astPrinter(rootNode)
        console.log(str)
        var exports
        try {
            exports = window.test(str)
        } catch (e) {
            console.log(e)
            return null
        }
        return exports;
    }
}

wasmjsTag.src = '/vendor/wasm_example.js'