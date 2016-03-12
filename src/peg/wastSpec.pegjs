{
  function extractList(list, index) {
    var result = new Array(list.length), i;

    for (i = 0; i < list.length; i++) {
      result[i] = list[i][index];
    }

    return result;
  }

  function buildList(head, tail, index) {
    return [head].concat(extractList(tail, index));
  }
  
  function optionalList(value) {
    return value !== null ? value : [];
  }

}


start=
	rows:(RuleRow / EmptyRow / AliasRow)* {return rows.filter(function(r){return r !== null})}
    
RuleRow=
	name:RuleName ":" __ head:RuleForm tail:(__ "|" __ RuleForm)* __ Comment? EOL {
        return {type:"rule", name:name.join(""), options: buildList(head, optionalList(tail), 3)}
    }
    
AliasRow=
	name:RuleName ":" __ head:RuleRef tail:(__ "|" __ RuleRef)* __ Comment? EOL {
        return {type:"alias", name:name.join(""), options: buildList(head, optionalList(tail), 3)}
    }
	
RuleForm=
	"("__ name:RuleName __ list:(__ (RuleRef / RuleForm))* __ ")" mod:OptionalModifier?{
    	var ob = {type:"form", name:name.join(""), children: extractList(list, 1)}
        if(mod){
        	ob.repeat = mod
        }
    	return ob
    }

RuleRef=
	"<" name:RuleName ">" mod:OptionalModifier?{
    	var ob = {type:"ruleRef", name: name.join("")}
        if(mod){
        	ob.repeat = mod
        }
    	return ob
    }

OptionalModifier=
	[?*]

RuleName=
	[0-9a-zA-Z_$]+
    
	
EOL=
	[\n\r]
    
Comment=
	";;" [^\n\r]*

__=
	WS*

EmptyRow=
	EOL {return null}

WS "whitespace"=
  "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  / [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]