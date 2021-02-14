// **********************************************
//  Electronメインウィンドウプロセス
// **********************************************

const PIXI = require('pixi.js');
const $ = require('jquery');
const { Game } = require('./game');

let game = new Game();
let bPause = false;

//Create a Pixi Application
let app = new PIXI.Application({ 
    view: document.getElementById('myCanvas'),
    width: 640, 
    height: 480,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);
app.renderer.autoResize = true;
app.stage.interactive = true;

//Add the canvas that Pixi automatically created for you to the HTML document
// document.body.appendChild(app.view);

const loader = PIXI.Loader.shared;
loader.add('images/characters.json');
loader.load((loader, resources) => {
    const N=0;
    const w = window.innerWidth;
    const h = window.innerHeight;

    let container = new PIXI.Container();
    app.stage.addChild(container);

    game.initGame(PIXI, container);

    // app.ticker.speed = 0.2;  // 効かなかった
    app.ticker.add((delta) => {
        if (game && !bPause) {
            game.gameLoop(PIXI, container);
        }
    });
});

let g_width;
let g_height;
// ロード時とリサイズ時の両方でイベントを受け取る
// https://qiita.com/chillart/items/15bc48f98897391e12ca
$(window).on('load resize', () => {
    let w = window.innerWidth-30;
    let h = window.innerHeight-50;
    app.renderer.resize(w, h);
});

$(window).on('keydown', e => {
    // console.log(`keydown (${e.which})`);
    switch (e.which) {
        case 37:    // left
        {
            game.onLeftPressed();
            break;
        }
        case 38:    // up
        {
            game.onUpPressed();
            break;
        }
        case 39:    // right
        {
            game.onRightPressed();
            break;
        }
        case 40:    // down
        {
            game.onDownPressed();
            break;
        }
        case 32:    // space
        {
            game.onSpacePressed();
            break;
        }
    }
});

$('#btPause').on('click', function() {
    bPause = !bPause;
});
