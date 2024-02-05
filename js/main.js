
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

const scoreBoard_UI = document.getElementById('score-board');
const scorePL1_UI = document.getElementById('score-pl1');
const scorePL2_UI = document.getElementById('score-pl2');

const scoreNamePL1_UI = document.getElementById('name-pl1');
const scoreNamePL2_UI = document.getElementById('name-pl2');

menuButton_play_UI.addEventListener("click", (event) => {
    showElement(menu_playList_UI, true);
    showElement(menu_settingsList_UI, false);
});
menuButton_play_UI.addEventListener("focusout", (event) => {
    if (event.relatedTarget) {
        if (event.relatedTarget.offsetParent.id == "play-list") { return; }
    }
    showElement(menu_playList_UI, false);
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
    showElement(menu_settingsList_UI, true);
    showElement(menu_playList_UI, false);
});

menuButton_settings_UI.addEventListener("focusout", focusout_settings_list);
settings_namePL1_UI.addEventListener("focusout", focusout_settings_list);
settings_namePL2_UI.addEventListener("focusout", focusout_settings_list);


function showElement(element, show) {
    element.style.display = show ? "inherit" : "none";
    element.style.visibility = show ? "visible" : "hidden";
}

function focusout_settings_list(event) {
    if (event.relatedTarget) {
        if (event.relatedTarget.offsetParent.id == "settings-list") { return; }
    }
    menu_settingsList_UI.style.display = "none";
    menu_settingsList_UI.style.visibility = "hidden";
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
            timerPBReset.start();
        }
        if (timerPBReset.isDone) { pongball.isReseted = false; }
    }

    objects_list.forEach( obj => {
        obj.updateElementPosition();
        obj.updateAnimation();
    });
}



let gameInterval = null;

function StartGame() {
    ResetGame();
    gameInterval = setInterval(onGameTick, TickInterval);

    mainMenu_UI.style.visibility = "hidden";
    scoreBoard_UI.style.visibility = "visible";
    screenGame.element.style.visibility = "visible";
}

function StopGame() {
    clearInterval(gameInterval);

    mainMenu_UI.style.visibility = "visible";
    scoreBoard_UI.style.visibility = "hidden";
    screenGame.element.style.visibility = "hidden";
}