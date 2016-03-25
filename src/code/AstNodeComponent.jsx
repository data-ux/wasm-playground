import React from 'react'

import {astOptions, astValidateType, astValidateTypePartial, astFilterOptionsPartial, astGetCompletion} from './astValidator'
import focus from './focus'
import renderers from './renderers'
import astParser from './astParser'


 var AstNodeComponent = React.createClass({
    getInitialState(){
        return {
            editableText: this.props.node.type,
            options: []
        }
    },
    handleChange(e){
        var input = e.target
        var newValue = e.target.value
        var callback
        if(astValidateTypePartial(this.state.options, '""')){
            if(newValue === '"'){
                if(this.state.editableText === '""'){
                    newValue = ''
                }else{
                    newValue = '""'
                    callback = function(){
                        input.setSelectionRange(1, 1)
                    }
                }
            }
        }
        if(astValidateTypePartial(this.state.options, newValue) || newValue.trim().length === 0){
            var tentatives = astFilterOptionsPartial(this.state.options, newValue)
            var tentative = this.state.tentative
            if(tentatives.indexOf(tentative) < 0){
                tentative = tentatives[0]
            }
            this.setState({editableText: newValue, tentative: tentative}, callback)
        }else{
            var delta = newValue.length - this.state.editableText.length
            var selStart = e.target.selectionStart - delta
            var selEnd = e.target.selectionEnd - delta
            this.setState({editableText: this.state.editableText}, function(){
                input.setSelectionRange(selStart, selEnd)
            })
        }
    },
    handleKeyDown: function(e){
        var node = this.props.node;
        var target = e.target
        var callback
        var newType = astGetCompletion(this.state.tentative, this.state.editableText)
        if(newType === '""'){
            callback = function(){target.setSelectionRange(1, 1)}
        }
        switch(e.key){
            case 'Enter':
                e.preventDefault()
                node.changeType(newType)
                this.setState({editableText: newType}, callback)
                var candidate = node.addChildAsFirst()
                if(astOptions(candidate).length === 0){
                    node.removeChild(candidate)
                }
                this.props.notifyUp(1)
                break
            case 'Tab':
                e.preventDefault()
                node.changeType(newType)
                this.setState({editableText: newType}, callback)
                var candidate = node.parent.addSiblingAfter(node)
                if(astOptions(candidate).length === 0){
                    node.parent.removeChild(candidate)
                }
                this.props.notifyUp(1)
                break
            case 'Backspace':
                if(this.state.editableText.length === 0){
                    e.preventDefault()
                    this.remove()
                    focus.previousOfType(this.refs.typeName)
                }
                break
            case 'ArrowLeft':
                if(target.selectionStart === 0 && target.selectionEnd === 0){
                    e.preventDefault()
                    if(node.parent.frozen && node.parent.isFirstChild(node)){
                        node.parent.addChildAsFirst()
                        this.props.notifyUp(1)
                        return
                    }
                    focus.previousOfType(target)
                }
                break
            case 'ArrowRight':
                    if(target.selectionStart === this.state.editableText.length && target.selectionEnd === this.state.editableText.length){
                        e.preventDefault()
                        if(!this.props.node.children.length && node.parent.parent && node.parent.isLastChild(node)){
                            node.parent.parent.addSiblingAfter(node.parent)
                            if(this.state.editableText.trim().length === 0){
                                this.remove()
                            }
                            this.props.notifyUp(2)
                            break
                        }
                        focus.nextOfType(target)
                    }
                break
            case 'ArrowDown':
                var tentatives = astFilterOptionsPartial(this.state.options, this.state.editableText)
                var tentative = this.state.tentative
                var index = tentatives.indexOf(tentative)
                if( index < 0){
                    tentative = tentatives[0]
                }
                if(index < tentatives.length -1){
                    tentative = tentatives[index + 1]
                }
                this.setState({tentative: tentative})
                break
            case 'ArrowUp':
                var tentatives = astFilterOptionsPartial(this.state.options, this.state.editableText)
                var tentative = this.state.tentative
                var index = tentatives.indexOf(tentative)
                if( index < 0){
                    tentative = tentatives[0]
                }
                if(index > 0){
                    tentative = tentatives[index - 1]
                }
                this.setState({tentative: tentative})
                break
        }
    },
    remove(){
        var node = this.props.node;
        node.parent.removeChild(node)
        this.props.notifyUp(1)
    },
    handleBlur(){
        if(this.state.editableText.trim().length === 0){
            this.remove()
            return
        }
        if(astValidateType(this.state.options, this.state.editableText)){
            this.props.node.changeType(this.state.editableText)
            this.setState({focused: false})
        }else{
            this.setState({editableText: this.props.node.type, focused: false})
        }
    },
    handleFocus(){
        if(this.state.editableText.substr(0, 1) === '"'){
            if(this.refs.typeName.selectionStart === 0){
                this.refs.typeName.setSelectionRange(1, 1)
            }
            if(this.refs.typeName.selectionStart === this.state.editableText.length){
                this.refs.typeName.setSelectionRange(this.state.editableText.length-1, this.state.editableText.length-1)
            }
        }
        var options = astOptions(this.props.node)
        var tentatives = astFilterOptionsPartial(options, this.state.editableText)
        this.setState({options: options, tentative: tentatives[0], focused: true})
    },
    handlePaste(e){
        e.preventDefault()
        var pasteText = e.clipboardData.getData("text")
        var parsed
        try{
            parsed = astParser(pasteText)
        }catch(ex){
            console.log(ex)
        }
        if(parsed){
            this.props.node.parent.replaceChild(this.props.node, parsed)
            this.props.notifyUp(1)
        }
    },
    handleAutocompleteClick(option){
        var newType = astGetCompletion(option, option)
        var callback
        if(newType === '""'){
            callback = () => {this.refs.typeName.setSelectionRange(1, 1)}
        }
        this.props.node.changeType(newType)
        this.setState({tentative: option, editableText: newType}, callback)
    },
    componentDidMount(){
        this.refs.typeName && this.refs.typeName.focus()
    },
    handleNotify(generations){
        if(generations === 1 || !generations){
            this.forceUpdate()
        }else{
            this.props.notifyUp(generations - 1)
        }
    },
    render(){
        var candidate = renderers[this.props.node.type]
        if(candidate){
             return candidate.call(this)
        }else{
            return renderers['generic'].call(this)
        }
    }
});

export default AstNodeComponent