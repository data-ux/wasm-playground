fs = require('fs');
var PEG = require("pegjs");


fs.readFile('src/PEG/wastSpec.pegjs', 'utf8', handlePEG);



function handlePEG(err, pegSrc) {
    if (err) {
        return console.log(err);
    }
    fs.readFile('src/astRules.txt', 'utf8', function(err, rulesTxt) {
        if (err) {
            return console.log(err);
        }
        var parser = PEG.buildParser(pegSrc);

        var asrtRules = parser.parse(rulesTxt);
        
        fs.writeFile('src/generated/astRules.js', "module.exports = \n" + JSON.stringify(asrtRules, null, '\t'));
    });

}



