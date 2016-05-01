export default function attachWasm(callback){
    var wasmjsTag = document.createElement('script')

    wasmjsTag.onload = function() {
        var loadWasm = function(code, argTypes) {
            var binaryen = Binaryen()

            var module = new binaryen.Module()
            var parser = new binaryen.SExpressionParser(code)

            var s_module = parser.get_root().getChild(0)

            var builder = new binaryen.SExpressionWasmBuilder(module, s_module)

            var interface_ = new binaryen.ShellExternalInterface()
            var instance = new binaryen.ModuleInstance(module, interface_)

            return function(exportName, argsArray){
                var name = new binaryen.Name(exportName)
                
                var argDef = argTypes[exportName];

                var args = new binaryen.LiteralList()
                argsArray.forEach( (argument, i) => {
                    switch(argDef[i]){
                        case 'i32':
                            args.push_back(new binaryen.I32Literal(argument))
                            return
                        case 'f32':
                            args.push_back(new binaryen.F32Literal(argument))
                            return
                        case 'f64':
                            args.push_back(new binaryen.F64Literal(argument))
                            return
                        default:
                            throw new TypeError('Unsupported export argument type or too many arguments');
                    }
                })
                var literal = instance.callExport(name, args)
                switch (literal.get_type()) {
                    case 1:
                        return literal.geti32();
                    case 3:
                        return literal.getf32();
                    case 4:
                        return literal.getf64();
                    default:
                        throw new TypeError('Unsupported return type')
                }
            }
        }
        callback(loadWasm)
    }

    document.body.appendChild(wasmjsTag)
    wasmjsTag.src = 'vendor/binaryen.js'
}