// Player controls with named actions
const Player1KeyControls = {
    'MoveUp'    : 'w',
    'MoveDown'  : 's',
    'MoveLeft'  : 'a',
    'MoveRight'  : 'd'
};

const Player2KeyControls = {
    'MoveUp'    : 'ArrowUp',
    'MoveDown'  : 'ArrowDown'
};


// Keyboard listener
let keyboard = new Set();

window.addEventListener('keydown',
    (event) => {
        if (event.repeat) { return; };
        keyboard.add(event.key);
    }
);

window.addEventListener('keyup',
    (event) => { keyboard.delete(event.key); }
);


// Key active checking
function isKeyPressed(keys) {
    if (typeof keys == 'object') {
        for (i=0; i <= keys.length; i++) {
            if ( keyboard.has(keys[i]) ) { return true; }
        }
        return false;
    }
    return keyboard.has(keys);
}

// Action active checking
function isActionActive(keycontrol, action) {
    return isKeyPressed(keycontrol[action]);
}
