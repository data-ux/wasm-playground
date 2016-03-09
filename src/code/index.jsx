import React from 'react'
import ReactDOM from 'react-dom'
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

var RootComponent = React.createClass({
    getInitialState() {
        return { root: this.props.root }
    },
    handleNotify() {
        this.forceUpdate()
    },
    componentDidMount() {
        this.timer = setInterval(() => {
            var json = AstNode.stringify(this.props.root)
            window.localStorage.setItem('ast', json)
            //console.log ('Saving to localStorage: ', json )
        }, 5000)/*
        AJAX('https://raw.githubusercontent.com/WebAssembly/spec/master/ml-proto/test/float_misc.wast', (response) => {
            var newRoot = astParser(response)
            newRoot.setFrozen(true)
            rootNode = newRoot
            this.setState({root: newRoot})
        })*/
    },
    componentWillUnmount() {
        clearInterval(this.timer)
    },
    render() {
        return <AstNodeComponent node={this.state.root} notifyUp={this.handleNotify}/>
    }
})


ReactDOM.render(<RootComponent root={rootNode} />, document.getElementById('wastedit-main'))

function AJAX(url, success) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() { success(this.responseText) });
    oReq.open("GET", url);
    oReq.send();
}

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
                },
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
            return {}
        }

        return module['asmExports']
    }
    window.compile = function() {
        var str = astPrinter(rootNode)
        console.log(str)
        return window.loadWasm(str);
    }
}

wasmjsTag.src = '/vendor/wasm.js'