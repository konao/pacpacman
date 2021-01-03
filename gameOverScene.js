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

        this._count = 0;
    }

    initSprites(PIXI, container) {
        this._container = new PIXI.Container();

        this._gameOverMsg
            .initSprite(PIXI, this._container)
            .setText('Game Over')
            .setFontSize(150)
            .setColor('white')  // or setColor('#ffffff') is also OK
            .setPos(350, 300);
        
        container.addChild(this._container);

        this._count = 0;
        this.setVisible(true);
    }

    setVisible(bVisible) {
        if (this._container) {
            this._container.visible = bVisible;
        }
    }

    update() {
        this._count++;

        if (this._count > 200) {
            this.setVisible(false);   // このシーンの全スプライトを非表示にする
            return C.SCENE_TITLE; // 次のシーン
        } else {
            return null;
        }
    }
}

module.exports = {
    GameOverScene
}