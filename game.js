// **********************************************
//  ゲーム本体（メインコントローラ）
// **********************************************

const C = require('./const');
const { TitleScene } = require("./titleScene");
const { GameScene } = require("./gameScene");

class Game {
    constructor() {
        // 状態
        this._state = C.TITLE;

        // スコア
        this._score = null;

        // 現在のシーンオブジェクト
        this._currScene = null;

        // 各シーンオブジェクト（先に作っておく）
        this._titleScene = new TitleScene();
        this._gameScene = new GameScene();
    }

    initGame() {
        // 最初のシーンオブジェクトをセット
        this._currScene = this._titleScene;
    }

    initSprites(PIXI, container) {
        this._titleScene.initSprites(PIXI, container);
    }

    onUpPressed() {
        if (this._currScene) {
            this._currScene.onUpPressed();
        }
    }

    onDownPressed() {
        if (this._currScene) {
            this._currScene.onDownPressed();
        }
    }

    onLeftPressed() {
        if (this._currScene) {
            this._currScene.onLeftPressed();
        }
    }

    onRightPressed() {
        if (this._currScene) {
            this._currScene.onRightPressed();
        }
    }

    onSpacePressed() {
        if (this._currScene) {
            this._currScene.onSpacePressed();
        }
    }

    gameLoop(PIXI, container) {
        if (this._currScene) {
            // 現在のシーンオブジェクトに処理を実行させる
            let nextMode = this._currScene.update();

            if (nextMode) {
                // シーン変更なら新しいシーンオブジェクトに切り替える
                switch (nextMode) {
                    case C.START:
                        this._gameScene.initStage();
                        this._gameScene.initSprites(PIXI, container);
                        this._gameScene.setVisible(true);

                        this._currScene = this._gameScene;
                        break;
                }
            }
        }
    }
}

module.exports = {
    Game
}