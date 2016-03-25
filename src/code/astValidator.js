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
    if (rule.type === 'rule') {
        rule.deciding = calculateDecidingDefIndex(rule)
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

function calculateDecidingDefIndex(rule){
    if(rule.options.length <= 1) return;
    var limit = rule.options[0].children.length
    var i
    var deciding
    for (i = 0; i < limit; i++) {
        var difference = rule.options.some( (option) => {
            return option.children[i].name !== rule.options[0].children[i].name
        })
        if(difference){
            deciding = i
            break
        }
    }
    if(typeof deciding === 'undefined'){
        console.log('no deciding found for rule: ', rule.name)
        return
    }
    console.log('deciding for rule ', rule.name, ': ', deciding)
    return deciding
}

export function astValidateType(options, candidate){
    return options.some( (option) => {
        var tester = atomRex[option]
        if (typeof tester === 'undefined') {
            return option === candidate
        }
        return tester.test(candidate)
    })
}

export function astValidateTypePartial(options, candidate){
    return options.some( (option) => {
        var tester = atomRexPartial[option]
        if (typeof tester === 'undefined') {
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
        if (typeof tester === 'undefined') {
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
    var results
    
    if (!rule) {
        return []
    }
    if(rule.options.length === 0){
        return []
    }
    if (rule.type === 'rule' && rule.options.length === 1) {
        results = getOptionsForIndex(rule.options[0].children, parent.children, nodeIndex)
        return results.sort()
    }
    var filteredOptions = getPossibleOptions(rule, node, nodeIndex)
    var optionResults = filteredOptions.map( (option) => {
        return getOptionsForIndex(option.children, parent.children, nodeIndex)
    })
    return concatAndDedup(optionResults).sort()
}

export function getUiString(option){
    var ui = uiStrings[option]
    if(typeof ui === 'undefined'){
        return option
    }
    return ui
}

export function clearInvalidChildren(node){
    node.children = node.children.filter(clearRecur)
}
function clearRecur(node){
    if(node.invalid) return false
    node.children = node.children.filter(clearRecur)
    return true
}

export function markValidityForSiblingsAfter(node, testType){
    var oldType = node.type
    if(typeof testType === 'string'){
        node.type = testType
    }
    var parent = node.parent
    var nodeIndex = parent.children.indexOf(node)
    for (var i = nodeIndex+1; i < parent.children.length; i++) {
        markValidity(parent.children[i])
    }
    node.type = oldType
}

export function markValidity(node){
    var options = astOptions(node)
    
    if(options.length === 0 || !astValidateType(options, node.type)){
        markInvalidRecur(node)
    }else{
        node.invalid = false
        node.children.forEach(markValidity)
    }
}
function markInvalidRecur(node){
    node.invalid = true;
    node.children.forEach(markInvalidRecur)
}

function getPossibleOptions(rule, node, nodeIndex){
    var decidingIndex = rule.deciding
    if(nodeIndex === decidingIndex){
        return rule.options
    }
    if(nodeIndex < decidingIndex){
        return [rule.options[0]]
    }
    // nodeIndex > decidingIndex === true
    return rule.options.filter( (option) => {
        var numOptions
        for (var i = 0; i < decidingIndex; i++) {
            numOptions = getOptionsForIndex(option.children, node.parent.children, i).length
            if(numOptions === 0) return false
        }
        return true
    })
    
}

function concatAndDedup(arrayOfArray){
    var flattened = Array.prototype.concat.apply([], arrayOfArray)
    var nameMap = {}
    flattened.forEach( (element) => nameMap[element] = true)
    return Object.keys(nameMap)
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
        if (typeof tester === 'undefined') {
            return form.name == node.type
        }
        return tester.test(node.type)
    }
}

var atomRex = {
    int: /^[0-9]+$/,
    float: /^[0-9]+(\.[0-9]+)?$/,
    $str: /^\$[a-zA-Z0-9-]+$/,
    string: /^".+"$/,
    name: /^[a-zA-Z0-9\$-_]+$/,
    offset: /^offset=[0-9]+$/,
    align: /^align=(1|2|4|8|16|32|64)$/
}
var atomRexPartial = {
    int: /^[0-9]*$/,
    float: /^[0-9]+(\.[0-9]*)?$/,
    $str: /^\$[a-zA-Z0-9-]*$/,
    string: /^".*"$/,
    name: /^[a-zA-Z0-9\$-_]*$/,
    offset: /(^offset=|^offset|^offse|^offs|^off|^of|^o)[0-9]*$/,
    align: /(^align=|^align|^alig|^ali|^al|^a)(1|2|3|4|6|8|16|32|64)?$/
}
var completions = {
    int: '0',
    float: '0.0',
    $str: '$name',
    string: '"str"',
    name: 'name',
    offset: 'offset=0',
    align: 'align=8'
}
var uiStrings = {
    int: '<int>',
    float: '<float>',
    $str: '<$name>',
    string: '<string>',
    name: '<name>',
    offset: '<offset>',
    align: '<align>'
}