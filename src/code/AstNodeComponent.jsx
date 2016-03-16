import React from 'react'

import {astOptions, astValidateType, astValidateTypePartial} from './astValidator'
import focus from './focus'
import renderers from './renderers'
import astParser from './astParser'


 var AstNodeComponent = React.createClass({
    getInitialState(){
        return {
            editable: this.props.node.type,
            options: []
        }
    },
    handleChange(e){
        var input = e.target
        if(astValidateTypePartial(this.state.options, '""')){
            if(e.target.value === '"'){
                if(this.state.editable === '""'){
                    this.setState({editable: ''})
                }else{
                    this.setState({editable: '""'}, function(){
                        input.setSelectionRange(1, 1)
                    })
                }
                return
            }
        }
        if(astValidateTypePartial(this.state.options, e.target.value) || e.target.value.trim().length === 0){
            var tentatives = this.state.options.filter( (option) => {
                return option.substr(0, e.target.value.length) === e.target.value
            })
            var tentative = this.state.tentative
            if(tentatives.indexOf(tentative) < 0){
                tentative = tentatives[0]
            }
            this.setState({editable: e.target.value, tentative: tentative})
        }else{
            var delta = e.target.value.length - this.state.editable.length
            var selStart = e.target.selectionStart - delta
            var selEnd = e.target.selectionEnd - delta
            this.setState({editable: this.state.editable}, function(){
                input.setSelectionRange(selStart, selEnd)
            })
        }
    },
    handleKeyDown: function(e){
        var node = this.props.node;
        var target = e.target
        switch(e.key){
            case 'Enter':
                e.preventDefault()
                if(this.state.editable.trim().length === 0 || !astValidateType(this.state.options, this.state.editable)){
                    break
                }
                node.changeType(this.state.editable)
                node.addSiblingAsFirst()
                this.props.notifyUp()
                break
            case 'Tab':
                e.preventDefault()
                if(this.state.editable.trim().length === 0 || !astValidateType(this.state.options, this.state.editable)){
                    break
                }
                node.changeType(this.state.editable)
                node.parent.addSiblingAfter(node)
                this.props.notifyUp()
                break
            case 'Backspace':
                if(this.state.editable.length === 0){
                    e.preventDefault()
                    this.remove()
                    focus.previousOfType(this.refs.typeName)
                }
                break
            case 'ArrowLeft':
                if(target.selectionStart === 0 && target.selectionEnd === 0){
                    e.preventDefault()
                    if(node.parent.frozen && node.parent.isFirstChild(node)){
                        node.parent.addSiblingAsFirst()
                        this.props.notifyUp()
                        return
                    }
                    focus.previousOfType(target)
                }
                break
            case 'ArrowRight':
                    if(target.selectionStart === this.state.editable.length && target.selectionEnd === this.state.editable.length){
                        e.preventDefault()
                        if(!this.props.node.children.length && node.parent.parent && node.parent.isLastChild(node)){
                            node.parent.parent.addSiblingAfter(node.parent)
                            if(this.state.editable.trim().length === 0){
                                this.remove()
                            }
                            this.props.notifyUp(2)
                            break
                        }
                        focus.nextOfType(target)
                    }
                break
            case 'ArrowDown':
                var tentatives = this.state.options.filter( (option) => {
                    return option.substr(0, this.state.editable) === this.state.editable
                })
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
                var tentatives = this.state.options.filter( (option) => {
                    return option.substr(0, this.state.editable) === this.state.editable
                })
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
        if(this.state.editable.trim().length === 0){
            this.remove()
            return
        }
        if(astValidateType(this.state.options, this.state.editable)){
            this.props.node.changeType(this.state.editable)
            this.setState({focused: false})
        }else{
            this.setState({editable: this.props.node.type, focused: false})
        }
    },
    handleFocus(){
        if(this.state.editable.substr(0, 1) === '"'){
            if(this.refs.typeName.selectionStart === 0){
                this.refs.typeName.setSelectionRange(1, 1)
            }
            if(this.refs.typeName.selectionStart === this.state.editable.length){
                this.refs.typeName.setSelectionRange(this.state.editable.length-1, this.state.editable.length-1)
            }
        }
        var options = astOptions(this.props.node)
        var tentatives = options.filter( (option) => {
                return option.substr(0, this.state.editable.length) === this.state.editable
            })
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
    componentDidMount(){
        this.refs.typeName && this.refs.typeName.focus()
    },
    handleNotify(generations){
        if(generations === 1){
            this.forceUpdate()
        }else{
            this.props.notifyUp(generations - 1)
        }
    },
    render(){
        var candidate = renderers[this.props.node.type]
        if(candidate){
             return candidate.bind(this)()
        }else{
            return renderers['generic'].bind(this)()
        }
    }
});

export default AstNodeComponent