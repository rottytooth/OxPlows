const ENTER_KEY = 13;
const BACKSPACE_KEY = 8;

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}
function reset() {
    let newsize = document.getElementById('size').value * 11;
    document.getElementById('container').style.width = (newsize + 30) + "px";
    document.getElementById('inside').style.width = (newsize + 80) + "px";
    document.getElementById('main').style.width = newsize + "px";
    document.getElementById("typedinput").value = "";
    document.getElementById("main").innerHTML = "<p></p>";
}

function addNewLine(using_enter) {
    let typedinput = document.getElementById("typedinput");
    let main = document.getElementById("main");
    let prev_line = main.lastElementChild;
    let new_line = document.createElement('p');

    // is new line blank
    if (isEmptyOrSpaces(prev_line.innerText)) {
        new_line.classList = prev_line.classList;
        prev_line.classList.add("blank");
    }
    // does new line need to be reversed 
    else if (!prev_line.classList.contains("rev")) {
        new_line.classList.add("rev");
    }

    main.appendChild(new_line);

    // clean up end of line
    if (!using_enter && typedinput.value[typedinput.value.length - 1] != ' ') {
        let lastIndex = prev_line.innerText.lastIndexOf(" ");
        typedinput.value = prev_line.innerText.substring(lastIndex, prev_line.innerText.length);
        prev_line.innerText = prev_line.innerText.substring(0, lastIndex);
        new_line.innerText = typedinput.value;
    } else
        typedinput.value = "";
}

function addCharacter(e) {
    if (e.ctrlKey || e.metaKey) {
        return true;
    }

    let typedinput = document.getElementById("typedinput");
    let main = document.getElementById("main");
    let width = parseInt(document.getElementById('size').value);
    let prev_line = main.lastElementChild;

    prev_line.innerText = typedinput.value;

    if (e.keyCode === ENTER_KEY) {
        addNewLine(true);
    }
    else if (typedinput.value.length >= width) {
        addNewLine(false);
    }

    // backspace on an empty line
    if (e.keyCode === BACKSPACE_KEY && 
        typedinput.value.length === 0 &&
        main.childNodes.length > 1) {
        
            main.removeChild(main.lastChild);
        if (main.lastChild.classList.contains("blank")) {
            main.removeChild(main.lastChild);
        }
        typedinput.value = main.lastChild.innerText;
    }
    return false;
}            

function save2img(scale) {
    let node = document.getElementById('main');

    domtoimage.toBlob(node, {
        width: node.clientWidth * scale,
        height: node.clientHeight * scale,
        style: {
            transform: 'scale('+scale+')',
            transformOrigin: 'top left'
        }
    }).then(function (blob) {
            saveAs(blob, '.png');
            clone.parentNode.removeChild(clone);
        });
}

function loadFromString(str) {
    for (let i = 0; i < str.length; i++) {
        document.getElementById("typedinput").value += str.charAt(i);
        addCharacter(str.charAt(i));
    }
}

// events
window.addEventListener("keydown", function(e) {
    if (!event.ctrlKey && !event.metaKey) {
        document.getElementById("typedinput").focus();
    }
}, false);
window.addEventListener("keyup", addCharacter);
window.addEventListener('paste', (event) => {
    event.preventDefault();

    let paste = (event.clipboardData || window.clipboardData).getData('text');
    loadFromString(paste);
});
window.addEventListener('load', (event) => {
    reset();        
    loadFromString("Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.");
});