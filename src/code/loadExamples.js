export default function loadExamples(base, callback) {
    AJAX(base + 'files.json', function(data){
        data = JSON.parse(data)
        if(!Array.isArray(data)) throw new TypeError('Example files must be listed in Array')
        
        var count = data.length
        var loaded = []
        
        data.forEach((example) => {
            AJAX(base + example.file, function(code){
                loaded.push({name: example.name, code: code})
                count--;
                if(count === 0){
                    callback(loaded)
                }
            })
        })
        
    }) 
}

function AJAX(url, success) {
    var oReq = new XMLHttpRequest()
    oReq.addEventListener("load", function() { success(this.responseText) })
    oReq.open("GET", url)
    oReq.send()
}