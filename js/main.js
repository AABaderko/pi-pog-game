
// Constants
const dt = (1 / 60);
const TickInterval = dt * 1000;

// Screen
const screenGame = new Screen('screen-game');

const centerPosition = screenGame.position.copy;
const distFromSideScreen = 40; // 'px'


// Player
const firstPlayer = new Character('player1', [distFromSideScreen, centerPosition.y]);
const secondPlayer = new Character('player2', [screenGame.size.x-distFromSideScreen, centerPosition.y]);

// Ping-pong ball
const pongball = new Projectile('pongball', centerPosition.copy, 1, 50);

// BotAI
const characterBot = new Bot(secondPlayer, pongball);

// Game settings
const gamePlayersScores = [];
gamePlayersScores[-1] = 0; gamePlayersScores[1] = 0;

let gamePlayMode = '1player'; //'1player' || '2player'
let gameDificulty = 'hard';
let gameRounds = 5;

const gameSettings = {
    'easy': {
        playerSpeed: 240,
        pongSpeedMin: 240,
        pongSpeedMax: 700,
        pongAngleMin: 20,
        pongAngleMax: 60,
        gameRound: 5
    },
    'medium': {
        playerSpeed: 350,
        pongSpeedMin: 400,
        pongSpeedMax: 1000,
        pongAngleMin: 20,
        pongAngleMax: 45,
        gameRound: 10
    },
    'hard': {
        playerSpeed: 500,
        pongSpeedMin: 600,
        pongSpeedMax: 1400,
        pongAngleMin: 10,
        pongAngleMax: 30,
        gameRound: 15
    },
};
gameSettings['default'] = gameSettings['easy'];

// Timers
const timerPBReset = new Timer(2 * 60); // pb - pongball



// UI Interfaces
const mainMenu_UI = document.getElementById('main-menu');
const menuButton_play_UI = document.getElementById('menu-button-play');
const menuButton_settings_UI = document.getElementById('menu-button-settings');

const menu_playList_UI = document.getElementById('play-list');
const playButton_1pl_UI = document.getElementById('play-button-1pl');
const playButton_2pl_UI = document.getElementById('play-button-2pl');

const menu_settingsList_UI = document.getElementById('settings-list');
const settings_namePL1_UI = document.getElementById('settings-name-pl1');
const settings_namePL2_UI = document.getElementById('settings-name-pl2');
const settings_colorPL1_UI = document.getElementById('settings-color-pl1');
const settings_colorPL2_UI = document.getElementById('settings-color-pl2');

const wloppy_UI = document.getElementById('wloppy');

const scoreBoard_UI = document.getElementById('score-board');
const scorePL1_UI = document.getElementById('score-pl1');
const scorePL2_UI = document.getElementById('score-pl2');

const scoreNamePL1_UI = document.getElementById('name-pl1');
const scoreNamePL2_UI = document.getElementById('name-pl2');

const gameOver_UI = document.getElementById('game-over');
const gamePlayerWins_UI = document.getElementById('player-wins');

showElement(menu_playList_UI, false);
showElement(menu_settingsList_UI, false);

menuButton_play_UI.addEventListener("click", (event) => {
    if (menu_playList_UI.style.display == "none") {
        showElement(menu_playList_UI, true);
        showElement(menu_settingsList_UI, false);
    } else {
        showElement(menu_playList_UI, false);
        menuButton_play_UI.blur();
    }
});

playButton_1pl_UI.addEventListener("click", (event) => {
    gamePlayMode = '1player';
    StartGame();
    showElement(menu_playList_UI, false);
});

playButton_2pl_UI.addEventListener("click", (event) => {
    gamePlayMode = '2player';
    StartGame();
    showElement(menu_playList_UI, false);
});


menuButton_settings_UI.addEventListener("click", (event) => {
    if (menu_settingsList_UI.style.display == "none") {
        showElement(menu_settingsList_UI, true);
        showElement(menu_playList_UI, false);
    } else {
        showElement(menu_settingsList_UI, false);
        menuButton_settings_UI.blur();
    }
});

let wloppyShineInterval = null;
let wloppyShineTimer = 0;

wloppy_UI.addEventListener("mousemove", (event) => {
    let rect = wloppy_UI.getBoundingClientRect();
    let mouse_pos = new Vector2(
        event.clientX - rect.left,
        event.clientY - rect.top
    )
    
    if (mouse_pos.x < 60) {
        wloppy_UI.style['background-image'] = 'url("img/wloppy-close-eye-l.svg")';
    } else if (mouse_pos.x > 100) {
        wloppy_UI.style['background-image'] = 'url("img/wloppy-close-eye-r.svg")';
    } else if (mouse_pos.y > 65) {
        if (!(wloppy_UI.style['background-image'] == 'url("img/wloppy-tongue.svg")')) {
            wloppy_UI.style['background-image'] = 'url("img/wloppy-tongue.svg")';
        }
        if (!wloppyShineInterval) { wloppyShineInterval = setInterval(setWloppyShine, 1000/60) }
    } else {
        wloppy_UI.style['background-image'] = null;
    }
});

function setWloppyShine() {
    let cur_image = wloppy_UI.style['background-image'];
    if (wloppyShineTimer >= 3600) {
        if (cur_image == 'url("img/wloppy-tongue.svg")') {
            console.log("Let's shine this star!")
            wloppy_UI.style['background-image'] = 'url("img/wloppy-tongue-shine.svg")';
        }
    }
    if (!(cur_image == 'url("img/wloppy-tongue.svg")' || cur_image == 'url("img/wloppy-tongue-shine.svg")')) {
        clearInterval(wloppyShineInterval);
        wloppyShineInterval = null;
        wloppyShineTimer = 0;
    }
    wloppyShineTimer++;
}

wloppy_UI.addEventListener("mouseout", (event) => {
    wloppy_UI.style['background-image'] = null;
})

function showElement(element, show) {
    element.style.display = show ? "inherit" : "none";
    element.style.visibility = show ? "visible" : "hidden";
}




function UpdatePlayerScores() {
    scorePL1_UI.innerHTML = gamePlayersScores[-1];
    scorePL2_UI.innerHTML = gamePlayersScores[ 1];
}

function ResetPlayerScores() {
    gamePlayersScores[-1] = 0;
    gamePlayersScores[ 1] = 0;
    UpdatePlayerScores();
}



function ResetGame() {
    ResetPlayerScores();

    firstPlayer.color = settings_colorPL1_UI.value;
    scoreNamePL1_UI.innerHTML = settings_namePL1_UI.value;

    if (gamePlayMode == '1player') {
        secondPlayer.color = "gray";//"#0000FF";
        scoreNamePL2_UI.innerHTML = "Бот🤖";
    } else if (gamePlayMode == '2player') {
        secondPlayer.color = settings_colorPL2_UI.value;
        scoreNamePL2_UI.innerHTML = settings_namePL2_UI.value;
    }

    firstPlayer.position.y = centerPosition.y;
    secondPlayer.position.y = centerPosition.y;

    screenGame.element.style['border-left-color'] = firstPlayer.team_color;
    screenGame.element.style['border-right-color'] = secondPlayer.team_color;

    pongball.resetParameters();

    timerPBReset.reset();
    onGameTick();
}



function PlayerControls(keyc, obj) {
    obj.velocity.xy = [0, 0];

    if (isActionActive(keyc, 'MoveUp'  )) { obj.velocity.y = obj.speed; } else
    if (isActionActive(keyc, 'MoveDown')) { obj.velocity.y =  -obj.speed; }
    // if (isActionActive(keyc, 'MoveLeft'  )) { obj.velocity.x = -obj.speed; } else
    // if (isActionActive(keyc, 'MoveRight')) { obj.velocity.x =  obj.speed; }
}

function onGameTick() {
    PlayerControls(Player1KeyControls, firstPlayer);
    if (gamePlayMode == '1player') {
        characterBot.updateMovement();
    } else if (gamePlayMode == '2player') {
        PlayerControls(Player2KeyControls, secondPlayer);
    }

    timers_list.forEach( timer => timer.update() );
    characters_list.forEach( char => {
        char.updateVelocity();
        char.updateCollision();
    });

    if (!pongball.isReseted) {
        pongball.updateVelocity();
        pongball.updateCollision();
    }
    if (pongball.isReseted) {
        if (!timerPBReset.isActive) { 
            UpdatePlayerScores();
            if ( (gamePlayersScores[-1] == (gameRounds-1)) && 
                 (gamePlayersScores[ 1] == (gameRounds-1)) ) {
                gameRounds++;
            }
            timerPBReset.start();
        }
        if (timerPBReset.isDone) { pongball.isReseted = false; }
    }

    if (Math.max(gamePlayersScores[-1], gamePlayersScores[1]) >= gameRounds) {
        showElement(gameOver_UI, true);
        gamePlayerWins_UI.innerText = "Победил:";
        if (gamePlayersScores[-1] >= gamePlayersScores[1]) {
            gamePlayerWins_UI.innerText += " "+scoreNamePL1_UI.innerHTML;
        } else {
            gamePlayerWins_UI.innerText += " "+scoreNamePL2_UI.innerHTML;
        }
        
        clearInterval(gameInterval);
    }

    objects_list.forEach( obj => {
        obj.updateElementPosition();
        obj.updateAnimation();
    });
}

function setGameSettings() {
    let g_def = gameSettings['default'];
    let g_set = gameSettings[gameDificulty];

    firstPlayer.speed = g_set.playerSpeed || g_def.playerSpeed;
    secondPlayer.speed = g_set.playerSpeed || g_def.playerSpeed;

    pongball.speed_min = g_set.pongSpeedMin || g_def.pongSpeedMin;
    pongball.speed_max = g_set.pongSpeedMax || g_def.pongSpeedMax;
    pongball.speed = pongball.speed_min;

    pongball.angle_min = g_set.pongAngleMin || g_def.pongAngleMin;
    pongball.angle_max = g_set.pongAngleMax || g_def.pongAngleMax;

    gameRounds = g_set.gameRound || g_def.gameRound;
}

let gameInterval = null;

function StartGame() {
    gameDificulty = document.querySelector("input[name='difficulty']:checked").value || 'easy';

    setGameSettings();
    ResetGame();
    gameInterval = setInterval(onGameTick, TickInterval);

    mainMenu_UI.style.visibility = "hidden";
    scoreBoard_UI.style.visibility = "visible";
    screenGame.element.style.visibility = "visible";
}

function StopGame() {
    clearInterval(gameInterval);

    if (gameOver_UI.style.visibility == "visible") {
        showElement(gameOver_UI, false);
    }

    mainMenu_UI.style.visibility = "visible";
    scoreBoard_UI.style.visibility = "hidden";
    screenGame.element.style.visibility = "hidden";
}