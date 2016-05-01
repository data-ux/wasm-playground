export default function attachWasm(callback){
    var wasmjsTag = document.createElement('script')

    wasmjsTag.onload = function() {
        var loadWasm = function(code, lookupImport) {
            var binaryen = Binaryen()

            var module = new binaryen.Module()
            var parser = new binaryen.SExpressionParser(code)

            var s_module = parser.get_root().getChild(0)

            var builder = new binaryen.SExpressionWasmBuilder(module, s_module)

            var interface_ = new binaryen.ShellExternalInterface()
            var instance = new binaryen.ModuleInstance(module, interface_)

            return function(exportName, argsArray){
                var name = new binaryen.Name(exportName)

                var args = new binaryen.LiteralList()
                argsArray.forEach( (argument) => {
                    args.push_back(new binaryen.Literal(argument))
                })
                
                return  instance.callExport(name, args).getf64()
            }
        }
        callback(loadWasm)
    }

    document.body.appendChild(wasmjsTag)
    wasmjsTag.src = 'vendor/binaryen.js'
}