export default function attachWasm(callback){
    var wasmjsTag = document.createElement('script')

    wasmjsTag.onload = function() {
        var loadWasm = function(code, lookupImport) {
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
        callback(loadWasm)
    }

    document.body.appendChild(wasmjsTag)
    wasmjsTag.src = 'vendor/wasm.js'
}