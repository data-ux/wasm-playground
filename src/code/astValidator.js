import astRules from '../generated/astRules.js'

var rootRulesMap = {}



astRules
    .forEach((rule) => rootRulesMap[rule.name] = rule)

astRules
    .forEach((rule) => inflateRefs(rule))



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

export function astValidateType(options, candidate){
    return options.some( (option) => {
        var tester = atomRex[option]
        if (!tester) {
            return option === candidate
        }
        return tester.test(candidate)
    })
}

export function astValidateTypePartial(options, candidate){
    return options.some( (option) => {
        var tester = atomRexPartial[option]
        if (!tester) {
            return option.substr(0, candidate.length) === candidate
        }
        return tester.test(candidate)
    })
}

export function astFilterOptionsPartial(options, candidate){
    if(candidate === ''){
        return options
    }
    return options.filter( (option) => {
        var tester = atomRexPartial[option]
        if (!tester) {
            return option.substr(0, candidate.length) === candidate
        }
        return tester.test(candidate)
    })
}

export function astGetCompletion(option, currentValue){
    var completion = completions[option]
    if(typeof completion === 'undefined'){
        return option
    }
    if(currentValue !== '' && astValidateTypePartial([option], currentValue)){
        return currentValue
    }
    return completion
}

export function astOptions(node) {
    var parent = node.parent
    var nodeIndex = parent.children.indexOf(node)
    var rule = rootRulesMap[parent.type]
    if (!rule) {
        return []
    }
    if(rule.options.length === 0){
        return []
    }
    if (rule.type === 'rule') {
        var options = getOptionsForIndex(rule.options[0].children, parent.children, nodeIndex)
        return options.sort()
    }
    // TODO multiple forms
}

function getOptionsForIndex(ruleDefs, siblings, index) {
    // let's see how sibligns "eat up" the ruleDefs
    var currentDef = 0
    var i = 0;
    console.log('eating starts  ---------------------')
    while (i < index) {
        var sibling = siblings[i];
        if (matchesDef(ruleDefs[currentDef], sibling)) {
            i++
            if (ruleDefs[currentDef].repeat !== '*') {
                console.log('child eaten: ', ruleDefs[currentDef].name, ' by ', sibling.type)
                currentDef++
            }
        } else {
            console.log('child eaten: ', ruleDefs[currentDef].name, ' by ', sibling.type)
            currentDef++
        }


        if (currentDef >= ruleDefs.length) {
            console.log('ran out of ruleDefs!')
            return []
        }
    }
    var node = siblings[index]
    var theOptions = []
    while (currentDef < ruleDefs.length) {
        var optionsFromDef = getOptionsFromDef(ruleDefs[currentDef])
        theOptions = theOptions.concat(optionsFromDef)
        if(!ruleDefs[currentDef].repeat){
            // must be this type.  stop here
            break
        }
        currentDef++
    }
    console.log('field options: ', theOptions)
    return theOptions
}

function getOptionsFromDef(ruleDef){
    if (ruleDef.type === 'ruleRef') {
        if (ruleDef.ref.type === 'rule') {
            return ruleDef.ref.name
        }
        if (ruleDef.ref.type === 'alias') {
            return ruleDef.ref.options.map((ruleDef) => {
                return ruleDef.ref.name
            })
        }
    }
    if (ruleDef.type === 'form') {
        return [ruleDef.name]
    }
}

function matchesDef(ruleDef, node) {
    if (ruleDef.type === 'ruleRef') {
        if (ruleDef.ref.type === 'rule') {
            return ruleDef.ref.options.some(formTest)
        }
        if (ruleDef.ref.type === 'alias') {
            return ruleDef.ref.options.some((ruleDef) => {
                return ruleDef.ref.options.some(formTest)
            })
        }
    }
    if (ruleDef.type === 'form') {
        return formTest(ruleDef)
    }
    function formTest(form) {
        var tester = atomRex[form.name]
        if (!tester) {
            return form.name == node.type
        }
        return tester.test(node.type)
    }
}

var atomRex = {
    int: /^[0-9]+$/,
    $str: /^\$[a-zA-Z0-9]+$/,
    string: /^".+"$/,
    name: /^[a-zA-Z0-9\$-_]+$/
}
var atomRexPartial = {
    int: /^[0-9]*$/,
    $str: /^\$[a-zA-Z0-9]*$/,
    string: /^".*"$/,
    name: /^[a-zA-Z0-9\$-_]*$/
}
var completions = {
    int: '0',
    $str: '$',
    string: '""',
    name: '',
}