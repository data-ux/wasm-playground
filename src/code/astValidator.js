import astRules from '../generated/astRules.js'

var rootRulesMap = {}



astRules
    .forEach((rule) => rootRulesMap[rule.name] = rule)
    
astRules
    .forEach( (rule) => inflateRefs( rule ) )



// Change refs by name to object refs

function inflateRefs(rule) {
    var ref
    if (rule.type === 'ruleRef') {
        ref = rootRulesMap[rule.name]
        if (!ref) {
            throw new SyntaxError('Root rule "' + rule.name + '" referenced, but not defined')
        }
        rule.ref = ref
    }


    var targetList
    if (rule.options) {
        targetList = rule.options
    }
    if (rule.children) {
        targetList = rule.children
    }
    if (targetList) {
        targetList.forEach((item) => inflateRefs(item))
    }
}

console.log(rootRulesMap)