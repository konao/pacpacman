// **********************************************
//  タイトル画面
// **********************************************

const C = require('./const');
const PIXI = require('pixi.js');
const { BaseScene } = require('./baseScene');
const { Text } = require('./text');

class TitleScene extends BaseScene {
    constructor() {
        super();

        this._container = null;

        this._mainTitle = new Text();
        this._title2 = new Text();
        this._title3 = new Text();

        this._startPressed = false;
    }

    initSprites(PIXI, container) {
        this._container = new PIXI.Container();

        this._mainTitle
            .initSprite(PIXI, this._container)
            .setText('PacPacMan')
            .setFontSize(150)
            .setColor('white')  // or setColor('#ffffff') is also OK
            .setPos(350, 300);
    
        this._title2
            .initSprite(PIXI, this._container)
            .setText('Press SPACE to start')
            .setFontSize(40)
            .setColor('cyan')
            .setPos(520, 500);

        this._title3
            .initSprite(PIXI, this._container)
            .setText('Copyright 2020 by konao')
            .setFontSize(25)
            .setColor('#008080')
            .setPos(570, 700);

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
            this._startPressed = false;
            return C.PLAY;
        } else {
            return null;
        }
    }
}

module.exports = {
    TitleScene
}