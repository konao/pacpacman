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

    initGame(PIXI, container) {
        // 最初のシーンオブジェクトをセット
        this._currScene = this._titleScene;

        // 初期化
        this._currScene.init(PIXI, container);
    }

    getScene(sceneID) {
        switch (sceneID) {
            case C.SCENE_TITLE:
                return this._titleScene;
            
            case C.SCENE_PLAY:
                return this._gameScene;
            
            case C.SCENE_GAMEOVER:
                return this._gameOverScene;
            
            default:
                return null;
        }
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
            let nextSceneID = this._currScene.update();

            if (nextSceneID) {
                let nextScene = this.getScene(nextSceneID);
                if (nextScene) {
                    // console.log(`nextMode=${nextMode}`);
                    // シーン変更なら新しいシーンオブジェクトに切り替える
                    this._currScene.cleanUp();
                    this._currScene.setVisible(false);

                    nextScene.init(PIXI, container);
                    nextScene.setVisible(true);
                    this._currScene = nextScene;
                }
            }
        }
    }
}

module.exports = {
    Game
}