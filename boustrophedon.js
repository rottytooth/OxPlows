const ENTER_KEY = 13;
const BACKSPACE_KEY = 8;

colorsets = [
    {
        desktop: "#ffffff",
        window: "#283237",
        text: "#ffffff",
        boxes: "#ffffff",
        name: "wh grn wh wh"
    },
    {
        desktop: "#006609",
        window: "#283237",
        text: "#00ff00",
        boxes: "#006609",
        name: "grn gry grn grn"
    },
    {
        desktop: "#7C7C7A",
        window: "#fcfcfc",
        text: "#555555",
        boxes: "#CDCDCD",
        name: "all greys"
    },
    {
        desktop: "#B1A9DD",
        window: "#212121",
        text: "#FEFC78",
        boxes: "#212121",
        name: "pur gry ylw gry"
    }
]

// whether the text is still in its initial state
var initialText;

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}
function reset() {
    let newsize = document.getElementById('size').value * 10;
    document.getElementById('container').style.width = (newsize + 120) + "px";
    document.getElementById('desktop').style.width = (newsize + 80) + "px";
    document.getElementById('window_outline').style.width = newsize + "px";
    document.getElementById('main').style.width = newsize + "px";
    document.getElementById("typedinput").value = "";
    document.getElementById("main").innerHTML = "<p></p>";
    initialText = false;
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

function addCharacterEvent(e) {
    if (e.ctrlKey || e.metaKey || e.key == "Meta") {
        return true;
    }

    let retval = addCharacter(e)

    // if it's a letter, number, or punctuation, count it as a content change
    if (initialText && e.key.length == 1) 
        initialText = false;
    return retval;
}

function addCharacter(e) {

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
    let node = document.getElementById('desktop');

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
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    if (!e.ctrlKey && !e.metaKey) {
        document.getElementById("typedinput").focus();
    }
    if (e.repeat) {
        // key is being held down
        addCharacterEvent(e);
    }
}, false);
window.addEventListener("keyup", addCharacterEvent);
window.addEventListener('paste', (e) => {
    e.preventDefault();

    let paste = (e.clipboardData || window.clipboardData).getData('text');
    loadFromString(paste);
});

function clickColor(clr, id) {
    document.getElementById(id).style.backgroundColor = clr.value;
}
function clickColorFront(clr, id) {
    document.getElementById(id).style.color = clr.value;
}

function windowClick() {
    if (initialText) {
        reset();
    }
}

// tools to select colors
function createColorControl(front, divname, name) {
    let colorset = colorsets[0];

    let colorControl = document.createElement("input");
    colorControl.setAttribute("type","color");
    colorControl.classList.add("colorpicker");
    colorControl.id = "colorch_" + name;

    if (front) {
        colorControl.addEventListener('change', function() { clickColorFront(this, divname)}, false);
        colorControl.setAttribute("value", colorset[name]);
        document.getElementById(divname).style.color = colorset[name];
    } else {
        colorControl.addEventListener('change', function() { clickColor(this, divname)}, false);
        colorControl.setAttribute("value", colorset[name]);
        document.getElementById(divname).style.backgroundColor = colorset[name];
    }
    document.getElementById("colorControls").appendChild(colorControl);
}

// dropdown to populate color selections
function createColorOptions() {
    let colorCombos = document.getElementById("colorCombos");
    for (let i = 0; i < colorsets.length; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerText = colorsets[i].name;
        colorCombos.appendChild(opt);
    }
    
    colorCombos.addEventListener("change", function() {
        let colorCombos = document.getElementById("colorCombos");
        colorset = colorsets[colorCombos.value];
        for (const property in colorset) {
            colorControl = document.getElementById("colorch_" + property);
            colorControl.value = colorset[property];   
            
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            colorControl.dispatchEvent(evt);

          }
    });
}

window.addEventListener('load', (event) => {
    reset();        
    loadFromString("Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.");

    createColorControl(false, "desktop", "desktop");
    createColorControl(false, "window_outline", "window");
    createColorControl(true, "main", "text");
    createColorControl(true, "window_outline", "boxes");

    document.getElementById("desktop").addEventListener("click", windowClick);
    document.getElementById("typedinput").focus();

    document.getElementById("typedinput").addEventListener("keydown", function(e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    });
    createColorOptions();

    setTimeout(function() { initialText = true; }, 100); // after key events from reload
});