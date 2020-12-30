// **********************************************
//  ゲームオーバー画面
// **********************************************

const C = require('./const');
const PIXI = require('pixi.js');
const { BaseScene } = require('./baseScene');
const { Text } = require('./text');

class GameOverScene extends BaseScene {
    constructor() {
        super();

        this._container = null;

        this._gameOverMsg = new Text();

        this._startPressed = false;
    }

    initSprites(PIXI, container) {
        this._container = new PIXI.Container();

        this._mainTitle
            .initSprite(PIXI, this._container)
            .setText('Game Over')
            .setFontSize(150)
            .setColor('white')  // or setColor('#ffffff') is also OK
            .setPos(350, 300);
    
        container.addChild(this._container);

        this.setVisible(true);
    }

    setVisible(bVisible) {
        if (this._container) {
            this._container.visible = bVisible;
        }
    }

    onSpacePressed() {
        // ゲーム開始
        this._startPressed = true;
    }

    update() {
        if (this._startPressed) {
            this.setVisible(false);   // このシーンの全スプライトを非表示にする
            return C.TITLE; // 次のシーン
        } else {
            return null;
        }
    }
}

module.exports = {
    GameOverScene
}