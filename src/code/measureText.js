var regular = document.createElement('span')
regular.classList.add('ast-node', 'dummy')
document.body.appendChild(regular)

var bold = document.createElement('span')
bold.classList.add('ast-node', 'bolded', 'dummy')
document.body.appendChild(bold)

function measure(str, useBold){
    if(useBold){
        bold.innerText = str;
        return bold.getBoundingClientRect().width
    }else{
        regular.innerText = str;
        return regular.getBoundingClientRect().width
    }
    
}


export default measure



