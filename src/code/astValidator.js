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

export function astOptions(node) {
    var parent = node.parent
    var nodeIndex = parent.children.indexOf(node)
    var rule = rootRulesMap[parent.type]
    if (!rule) {
        return []
    }
    if (rule.type === 'rule') {
        return getOptionsForIndex(rule.options[0].children, parent.children, nodeIndex)
    }
    // TODO multiple forms
}

function getOptionsForIndex(children, siblings, index) {
    // let's see how sibligns "eat up" the children
    var currentChild = 0
    var i = 0;
    console.log('eating starts  ---------------------')
    while (i < index) {
        var sibling = siblings[i];
        if (matchesDef(children[currentChild], sibling)) {
            i++
            if (children[currentChild].repeat !== '*') {
                console.log('child eaten: ', children[currentChild].name, ' by ', sibling.type)
                currentChild++
            }
        } else {
            console.log('child eaten: ', children[currentChild].name, ' by ', sibling.type)
            currentChild++
        }


        if (currentChild >= children.length) {
            console.log('ran out of children!')
            return []
        }
    }
    var node = siblings[index]
    var theOptions = []
    while (currentChild < children.length) {
        var optionsFromDef = GetOptionsFromDef(children[currentChild])
        theOptions = theOptions.concat(optionsFromDef)
        if(!children[currentChild].repeat){
            // must be this type. end of line
            break
        }
        currentChild++
    }
    console.log('field options: ', theOptions)
    return theOptions
}

function GetOptionsFromDef(ruleDef){
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
        if (form.children.length > 0) {
            return form.name == node.type
        } else {
            var tester = atomRex[form.name]
            if (!tester) console.log('No tester for ', form.name)
            return tester.test(node.type)
        }
    }
}



var atomRex = {
    int: /^[0-9]$/,
    $str: /^\$[a-zA-Z0-9]+$/,
    string: /^".+"$/,
    i32: /^i32$/,
    i64: /^i64$/,
    f32: /^f32$/,
    f64: /^f64$/,
    name: /^[a-zA-Z0-9\$-_]+$/,

    nop: /^nop$/,
    unreachable: /^unreachable$/,
    memory_size: /^memory_size$/,
    grow_memory: /^grow_memory$/
}