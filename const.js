// **********************************************
//  各種定数
// **********************************************

// キャラクターイメージの幅（ピクセル数）
const IMGW = 26;   // 1つのキャラクタは26x26ピクセル

const NODIR = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

const SCENE_TITLE = 1;
const SCENE_DEMO = 2;
const SCENE_PLAY = 3;
const SCENE_GAMEOVER = 10;

const PLAY_STANDBY = 1;
const PLAY_NORMAL = 10;
const PLAY_POWERUP = 20;
const PLAY_SCENE_CLEARED = 30;
const PLAY_DYING = 40;
const PLAY_RESTART = 50;

const AKEBEE = 1;
const PINKY = 2;
const MIDSUKE = 3;
const GUZUTA = 4;
const IJIKE = 5;

const CHERRY = 0;
const STRAWBERRY = 1;
const ORANGE = 2;
const APPLE = 3;
const MELON = 4;
const GALAXIAN = 5;
const BELL = 6;
const KEY = 7;

module.exports = {
    IMGW,

    NODIR,
    UP,
    RIGHT,
    DOWN,
    LEFT,

    SCENE_TITLE,
    SCENE_DEMO,
    SCENE_PLAY,
    SCENE_GAMEOVER,

    PLAY_STANDBY,
    PLAY_NORMAL,
    PLAY_POWERUP,
    PLAY_SCENE_CLEARED,
    PLAY_DYING,
    PLAY_RESTART,

    AKEBEE,
    PINKY,
    MIDSUKE,
    GUZUTA,
    IJIKE,

    CHERRY,
    STRAWBERRY,
    ORANGE,
    APPLE,
    MELON,
    GALAXIAN,
    BELL,
    KEY
}