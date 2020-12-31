// **********************************************
//  ゲームシーン
// **********************************************

const C = require('./const');
const { Stage, SPACE, WALL, DOT, POWER_FOOD } = require('./stage');
const { Pacman } = require('./pacman');
const Utils = require('./utils');
const { Enemy } = require('./enemy');
const { Text } = require('./text');
const { Score } = require('./score');

// ---------------------------------
// ゲーム本体制御
// ---------------------------------
class GameScene {
    constructor() {
        this._container = null;

        // スコア、残りパックマン数表示用スプライト
        this._score = null;
        this._hiScore = null;
        this._restPacman = null;

        // ステージ
        this._stage = null;

        // パックマン
        this._pacman = null;

        // 敵
        this._enemies = [];
    }

    initStage() {
        // パックマンの残り数
        this._pacRest = 2;

        // 状態
        this._state = C.PLAY_NORMAL;

        this._stage = new Stage();
        this._stage.generate(4, 8, 6);
        // this._stage.print();
        
        this._pacman = new Pacman();
        this._pacman.setPos({x: 1.0, y: 1.0});
        this._pacman.setStage(this._stage);

        // debug
        this._stage.searchAllWayPoints();

        // ランダムにn個のウェイポイントを選び出す
        // ---> そこをモンスターの位置とする
        this._enemies = [];
        const nEnemies = 5; // ****** モンスターの数 ******
        let wps = this._stage.getRandomWayPoints(nEnemies);
        for (let i=0; i<nEnemies; i++) {
            let kind = Utils.randInt(4)+1;
            let enemy = new Enemy(kind);
            enemy.setPos(wps[i]);
            // console.log(`[${i}] pos=(${wps[i].x}, ${wps[i].y})`);
            enemy.setDirec(C.NODIR);
            enemy.setStage(this._stage);
            this._enemies.push(enemy);
        }

        this._score = new Score('Score');
        this._hiScore = new Score('Hi-Score');
        this._restPacman = new Score('Pacman Left');
    }

    reinitStage() {
        // パックマンを出現させる新しい位置を計算
        let wps = this._stage.getRandomWayPoints(1);
        this._pacman.setPos(wps[0]);
        this._pacman.updateSprite();
    }

    // @param PIXI [i] PIXIオブジェクト
    // @param container [i] PIXI.containerオブジェクト
    initSprites(PIXI, container) {
        this._container = new PIXI.Container();

        // stageに対応するスプライト生成
        this._stage.initSprite(PIXI, this._container);

        // pacmanスプライト生成
        this._pacman.initSprite(PIXI, this._container);

        // 敵スプライト生成
        for (let i=0; i<this._enemies.length; i++) {
            this._enemies[i].initSprite(PIXI, this._container);
        }

        this._score.initSprite(PIXI, this._container);
        this._score.setPos(1150, 20);
        this._score.setFontSize(30);
        this._score.setValue(0);

        this._hiScore.initSprite(PIXI, this._container);
        this._hiScore.setPos(1150, 100);
        this._hiScore.setFontSize(30);
        this._hiScore.setValue(0);

        this._restPacman.initSprite(PIXI, this._container);
        this._restPacman.setPos(1150, 300);
        this._restPacman.setFontSize(30);
        this._restPacman.setValue(this._pacRest);

        container.addChild(this._container);
        this.setVisible(false);
    }

    setVisible(bVisible) {
        this._container.visible = bVisible;
    }

    onUpPressed() {
        this._pacman.setDirec(C.UP);
    }

    onDownPressed() {
        this._pacman.setDirec(C.DOWN);
    }

    onLeftPressed() {
        this._pacman.setDirec(C.LEFT);
    }

    onRightPressed() {
        this._pacman.setDirec(C.RIGHT);
    }

    onSpacePressed() {
        this._pacman.setDirec(C.NODIR);
    }

    update() {
        switch(this._state) {
            case C.PLAY_NORMAL:
                {
                    // パックマン移動
                    if (this._pacman) {
                        this._pacman.move();
            
                        let eatCount = this._pacman.detectCollision(this._stage);
                        this._score.incrValue(eatCount * 10);
                    }
            
                    // 敵移動
                    if (this._enemies && this._enemies.length > 0) {
                        for (let i=0; i<this._enemies.length; i++) {
                            let enemy = this._enemies[i];
                            enemy.move(this._pacman.getPos());
                            enemy.updateSprite();
            
                            // 衝突判定
                            if (enemy.detectCollision(this._pacman.getPos())) {
                                // 捕まった
                                this._pacRest--;
                                this._restPacman.setValue(this._pacRest);

                                this._state = C.PLAY_DYING;
                                this._pacman.startDyingAnim();
                                break;
                            }
                        }
                    }
                }
                break;
            
            case C.PLAY_POWERUP:
                {
                    // パワーアップ中
                }
                break;
            
            case C.PLAY_DYING:
                {
                    // 捕まった

                    // パックマンがしおれるアニメーション
                    if (!this._pacman.doDyingAnim())
                    {
                        // アニメーション終了
                        if (this._pacRest === 0) {
                            // 残りが0ならゲームオーバー
                            return C.GAMEOVER;
                        } else {
                            // まだいるならリスタート
                            this._pacman.stopDyingAnim();
                            this._state = C.PLAY_NORMAL;
                            return C.RESTART;
                        }
                    }
                }
                break;
        }

        return null;
    }
}

module.exports = {
    GameScene
}