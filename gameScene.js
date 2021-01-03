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
        this._PIXI = null;  // PIXIオブジェクト
        this._parentContainer = null;   // 親コンテナ
        this._container = null; // このシーンのスプライトを格納するコンテナ

        // スコア、残りパックマン数表示用スプライト
        this._score = null;
        this._hiScore = null;
        this._restPacman = null;
        this._restDot = null;   // for debug

        // スコア、ハイスコア（の値）
        this._scoreValue = 0;
        this._hiscoreValue = 0;

        // ステージ
        this._stage = null;

        // パックマン
        this._pacman = null;

        // 敵
        this._enemies = [];

        // 状態
        this._state = null;

        // パックマンの残り数
        this._pacRest = 2;

        // ドット残り数
        this._dotRest = 0;

        // シーンクリア時アニメーション用
        this._sceneClearedAnimCount = 0;
        this._sceneClearedAnimTimer = 0;
    }

    initStage(PIXI, container) {
        this._PIXI = PIXI;
        this._parentContainer = container;
        
        // 状態
        this._state = C.PLAY_STANDBY;

        this._stage = new Stage();

        this._score = new Score('Score');
        this._hiScore = new Score('Hi-Score');
        this._restPacman = new Score('Pacman Left');
        this._restDot = new Score('Dots left');
    }

    setupNewStage() {
        this._stage.generate(4, 8, 6);
        // this._stage.print();
        this._dotRest = this._stage.countDots();
        
        this._stage.searchAllWayPoints();

        // ランダムにn個のウェイポイントを選び出す
        // ---> そこをモンスターの位置とする
        this._enemies = [];
        const nEnemies = 5; // ****** モンスターの数 ******
        let wps = this._stage.getRandomWayPoints(nEnemies);
        for (let i=0; i<nEnemies; i++) {
            let kind = Utils.randInt(4)+1;  // モンスターの種類
            let enemy = new Enemy(kind);
            enemy.setPos(wps[i]);
            // console.log(`[${i}] pos=(${wps[i].x}, ${wps[i].y})`);
            enemy.setDirec(C.NODIR);
            enemy.setStage(this._stage);
            this._enemies.push(enemy);
        }

        this._pacman = new Pacman();
        let p = this.findNewPosForPacman();
        this._pacman.setPos(p);
        this._pacman.setStage(this._stage);

        this._pacman.startStandbyAnim();
    }

    restartStage() {
        // パックマンを出現させる新しい位置を計算
        let p = this.findNewPosForPacman();
        this._pacman.setPos(p);
        this._pacman.updateSprite();

        this._pacman.startStandbyAnim();
    }

    // パックマンを出現させる位置を計算
    // モンスターからある程度離れた場所を探す
    //
    // @return {x, y} ... パックマンを出現させる位置
    findNewPosForPacman() {
        // モンスターの位置のリストを作成
        let enemyPosList = this._enemies.map((e) => { return e.getPos(); });

        let p = this._stage.getRandomWayPoints(1)[0];   // ランダムに位置を生成
        let nearest = Utils.getNearestPos(p, enemyPosList); // pとモンスターの最小距離を計算
        while (nearest.minDist < 8) {
            // 近くにモンスターがいる．新しい場所を探す
            p = this._stage.getRandomWayPoints(1)[0];
            nearest = Utils.getNearestPos(p, enemyPosList);
        }

        return p;
    }

    // @param PIXI [i] PIXIオブジェクト
    initSprites() {
        let PIXI = this._PIXI;

        if (this._container) {
            // 前のスプライトが残っていれば消す
            this._container.removeChildren();
        }

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
        this._score.setValue(this._scoreValue);

        this._hiScore.initSprite(PIXI, this._container);
        this._hiScore.setPos(1150, 100);
        this._hiScore.setFontSize(30);
        this._hiScore.setValue(this._hiscoreValue);

        this._restPacman.initSprite(PIXI, this._container);
        this._restPacman.setPos(1150, 300);
        this._restPacman.setFontSize(30);
        this._restPacman.setValue(this._pacRest);

        this._restDot.initSprite(PIXI, this._container);
        this._restDot.setPos(1150, 400);
        this._restDot.setFontSize(30);
        this._restDot.setValue(this._dotRest);

        this._parentContainer.addChild(this._container);
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
            case C.PLAY_STANDBY:
                {
                    if (!this._pacman.doStandbyAnim())
                    {
                        this._pacman.stopStandbyAnim();
                        this._state = C.PLAY_NORMAL;
                    }
                }
                break;

            case C.PLAY_NORMAL:
                {
                    // パックマン移動
                    if (this._pacman) {
                        this._pacman.move();
            
                        let eatCount = this._pacman.detectCollision(this._stage);
                        this._scoreValue += eatCount * 10;
                        this._score.setValue(this._scoreValue);
                        if (this._scoreValue > this._hiscoreValue) {
                            // ハイスコア更新
                            this._hiscoreValue = this._scoreValue;
                            this._hiScore.setValue(this._hiscoreValue);
                        }
                        this._dotRest -= eatCount;
                        this._restDot.setValue(this._dotRest);

                        if (this._dotRest <= 0) {
                            // 面クリア
                            this._state = C.PLAY_SCENE_CLEARED;
                            this._sceneClearedAnimTimer = 0;
                            this._sceneClearedAnimCount = 0;
                            break;
                        }
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
            
            case C.PLAY_SCENE_CLEARED:
                {
                    // 面クリア
                    this._sceneClearedAnimTimer++;
                    if (this._sceneClearedAnimTimer >= 10) {
                        this._sceneClearedAnimTimer = 0;
            
                        // カウンタ更新
                        this._sceneClearedAnimCount++;
                        if (this._sceneClearedAnimCount >= 10) {
                            // アニメーション終了
                            this._sceneClearedAnimCount = 0;
                            
                            // 次の面を開始する
                            this.setupNewStage();
                            this.initSprites();
                            this.setVisible(true);
    
                            this._state = C.PLAY_STANDBY;
                        } else {
                            // モンスターを点滅させる
                            this._enemies.forEach((e) => { e.setVisible((this._sceneClearedAnimCount % 2) === 0); });
                        }
                    }
                }
                break;
            
            case C.PLAY_DYING:
                {
                    // 捕まった

                    // パックマンがしおれるアニメーション
                    if (!this._pacman.doDyingAnim())
                    {
                        // アニメーション終了
                        if (this._pacRest <= 0) {
                            // 残りが0ならゲームオーバー
                            return C.SCENE_GAMEOVER;
                        } else {
                            // まだいるならリスタート
                            this._pacman.stopDyingAnim();
                            this._state = C.PLAY_STANDBY;
                            return C.SCENE_RESTART;
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