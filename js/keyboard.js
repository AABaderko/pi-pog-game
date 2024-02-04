// Player controls with named actions
const Player1KeyControls = {
    'MoveUp'    : 'KeyW',
    'MoveDown'  : 'KeyS',
    'MoveLeft'  : 'KeyA',
    'MoveRight'  : 'KeyD'
};

const Player2KeyControls = {
    'MoveUp'    : 'ArrowUp',
    'MoveDown'  : 'ArrowDown'
};


// Keyboard listener
let keyboard = new Set();

let current_keycombo = '';
let key_combinations = {
    // 'hesoyam'
    '72698379896577': () => {ResetPlayerScores()},
    // 'win1'
    '87737849': () => {
        gamePlayersScores[-1] += 10;
        UpdatePlayerScores();
    },
    // 'win2'
    '87737850': () => {
        gamePlayersScores[1] += 10;
        UpdatePlayerScores();
    }
}

window.addEventListener('keydown',
    (event) => {
        if (event.repeat) { return; };
        keyboard.add(event.code);

        current_keycombo += event.keyCode;
        // console.log(event.code, event.keyCode);
        checkKeyCombinations();
    }
);

window.addEventListener('keyup',
    (event) => { keyboard.delete(event.code); }
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

function checkKeyCombinations() {
    let match = null;
    for (let keycombo in key_combinations) {
        match = keycombo.match(current_keycombo);
        if (match) {
            if (match.index == 0) {
                if (current_keycombo == keycombo) {
                    key_combinations[keycombo]();
                    console.log("Key combination activated");
                    match = null;
                }
                break;
            } else { match = null }
        }
    }
    if (!match) { current_keycombo = '' }
}