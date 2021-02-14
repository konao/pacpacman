// **********************************************
//  ゲーム本体（メインコントローラ）
// **********************************************

const C = require('./const');
const { TitleScene } = require("./titleScene");
const { GameScene } = require("./gameScene");
const { GameOverScene } = require("./gameOverScene");

class Game {
    constructor() {
        // スコア
        this._score = null;

        // 現在のシーンオブジェクト
        this._currScene = null;

        // 各シーンオブジェクト（先に作っておく）
        this._titleScene = new TitleScene();
        this._gameScene = new GameScene();
        this._gameOverScene = new GameOverScene();
    }

    initGame() {
        // 最初のシーンオブジェクトをセット
        this._currScene = this._titleScene;
    }

    initSprites(PIXI, container) {
        this._titleScene.init(PIXI, container);
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
            let nextScene = this._currScene.update();

            if (nextScene) {
                // console.log(`nextMode=${nextMode}`);
                // シーン変更なら新しいシーンオブジェクトに切り替える
                switch (nextScene) {
                    case C.SCENE_TITLE:
                        // タイトル画面
                        this._titleScene.init(PIXI, container);
                        this._titleScene.setVisible(true);
                        this._currScene = this._titleScene;
                        break;

                    case C.SCENE_DEMO:
                        // デモプレイ画面
                        break;
    
                    case C.SCENE_PLAY:
                        // プレイ中
                        this._gameScene.init(PIXI, container);
                        this._gameScene.setupNewStage();
                        this._gameScene.initSprites();
                        this._gameScene.setVisible(true);

                        this._currScene = this._gameScene;
                        break;
                    
                    case C.SCENE_RESTART:
                        // 再スタート画面
                        this._gameScene.restartStage();
                        // this._gameScene.setVisible(true);

                        this._currScene = this._gameScene;
                        break;
                        
                    case C.SCENE_GAMEOVER:
                        // ゲームオーバー
                        container.removeChildren();

                        this._gameOverScene.init(PIXI, container);
                        this._currScene = this._gameOverScene;

                        break;
                }
            }
        }
    }
}

module.exports = {
    Game
}