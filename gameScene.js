// **********************************************
//  ゲームシーン
// **********************************************

const C = require('./const');
const { BaseScene } = require('./baseScene');
const { Stage, SPACE, WALL, DOT, POWER_FOOD, FRUIT } = require('./stage');
const { Pacman } = require('./pacman');
const Utils = require('./utils');
const { Enemy } = require('./enemy');
const { Text } = require('./text');
const { Number } = require('./number');
const { Fruit } = require('./fruit');
const { PowerFood } = require('./powerFood');

// ---------------------------------
// ゲーム本体制御
// ---------------------------------
class GameScene extends BaseScene {
    constructor() {
        super();

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

        // パワーえさ
        this._powerFoods = [];

        // 状態
        this._state = null;

        // パックマンの残り数
        this._pacRest = 0;

        // ドット残り数
        this._dotRest = 0;

        // シーンクリア時アニメーション用
        this._sceneClearedAnimCount = 0;
        this._sceneClearedAnimTimer = 0;

        // パワーアップカウント
        this._powerUpModeTimer = 0;

        // フルーツ
        this._fruit = null;
    }

    init(PIXI, container) {
        this._PIXI = PIXI;
        this._parentContainer = container;
        
        this._scoreValue = 0;
        this._pacRest = 2;  // ゲーム開始時のパックマンの残り数

        // 状態
        this._state = C.PLAY_STANDBY;

        this._stage = new Stage();

        this._score = new Number('Score');
        this._hiScore = new Number('Hi-Score');
        this._restPacman = new Number('Pacman Left');
        this._restDot = new Number('Dots left');

        this._fruit = new Fruit();

        this.setupNewStage();
        this.initSprites();
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

        // パックマン
        this._pacman = new Pacman();
        let p = this.findNewPosForPacman();
        this._pacman.setPos(p);
        this._pacman.setStage(this._stage);

        // パワーえさ
        let powerFoodPosList = this.findPosForPowerFoods();
        this._powerFoods = powerFoodPosList.map((p) => {
            let pf = new PowerFood();
            pf.setCellPos(p);
            return pf;
        });

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

    // パワーえさを出現させる位置を計算
    findPosForPowerFoods() {
        // パワーえさの数
        const nPowerFoods = 5;
        let pfPosList = this._stage.getRandomWayPoints(nPowerFoods);

        return pfPosList;
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

        // スコア
        this._score.initSprite(PIXI, this._container);
        this._score.setPos(1150, 20);
        this._score.setFontSize(30);
        this._score.setValue(this._scoreValue);

        // ハイスコア
        this._hiScore.initSprite(PIXI, this._container);
        this._hiScore.setPos(1150, 100);
        this._hiScore.setFontSize(30);
        this._hiScore.setValue(this._hiscoreValue);

        // 残りパックマン数
        this._restPacman.initSprite(PIXI, this._container);
        this._restPacman.setPos(1150, 300);
        this._restPacman.setFontSize(30);
        this._restPacman.setValue(this._pacRest);

        // 残りドット数
        this._restDot.initSprite(PIXI, this._container);
        this._restDot.setPos(1150, 400);
        this._restDot.setFontSize(30);
        this._restDot.setValue(this._dotRest);

        // フルーツ
        this._fruit.initSprite(PIXI, this._container);

        // パワーえさ
        this._powerFoods.forEach((pf) => {
            pf.initSprite(PIXI, this._container);
            pf.updateSprite();
            pf.setVisible(true);
        })

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
            case C.PLAY_POWERUP:                
                {
                    // パックマン移動
                    if (this._pacman) {
                        this._pacman.move();

                        // ドット処理
                        let eatCount = this._pacman.detectCollisionWithDot(this._stage);
                        this._scoreValue += eatCount * 10;
                        this._score.setValue(this._scoreValue);
                        if (this._scoreValue > this._hiscoreValue) {
                            // ハイスコア更新
                            this._hiscoreValue = this._scoreValue;
                            this._hiScore.setValue(this._hiscoreValue);
                        }
                        this._dotRest -= eatCount;
                        this._restDot.setValue(this._dotRest);

                        // フルーツ処理
                        this._fruit.updateShowCount();
                        if ((this._dotRest % 10) === 0) {
                            // 残りドットが10の倍数になったらフルーツを出現させる
                            if (!this._fruit.getVisible()) {
                                // 出現させるのはフルーツが表示されていない場合のみ
                                let fruitPos = this._stage.searchPlaceForFruit();
                                if (fruitPos) {
                                    // console.log(`fruitPos=(${fruitPos.x}, ${fruitPos.y})`);
                                    this._fruit.setCellPos(fruitPos);
                                    this._fruit.updateSprite();
                                    this._fruit.setVisible(true);
                                    this._fruit.initShowCount();
                                }
                            }
                        }

                        if (this._fruit.getVisible() && this._pacman.detectCollision(this._fruit.getPos())) {
                            // フルーツを食べた
                            this._fruit.setVisible(false);

                            // 次に出現するフルーツを変える
                            this._fruit.setKindToNext();

                            // 点数更新
                            this._scoreValue += this._fruit.getFruitPoint();                            
                            this._score.setValue(this._scoreValue);
                            if (this._scoreValue > this._hiscoreValue) {
                                // ハイスコア更新
                                this._hiscoreValue = this._scoreValue;
                                this._hiScore.setValue(this._hiscoreValue);
                            }

                            console.log(`** I got a fruit! (bonus=${this._fruit.getFruitPoint()}) **`);
                        }

                        // パワーえさ処理
                        this._powerFoods.forEach((pf) => {
                            if (pf.getValid()) {
                                // 点滅させる
                                pf.updateShowCount();

                                // 衝突判定
                                if (this._pacman.detectCollision(pf.getPos())) {
                                    // パワーえさを食べた
                                    pf.setValid(false); // もはや食べられてしまった
                                    pf.setVisible(false);   // 表示も消す

                                    // 点数加算
                                    this._scoreValue += 500;

                                    this._score.setValue(this._scoreValue);
                                    if (this._scoreValue > this._hiscoreValue) {
                                        // ハイスコア更新
                                        this._hiscoreValue = this._scoreValue;
                                        this._hiScore.setValue(this._hiscoreValue);
                                    }
            
                                    // 敵の移動モードを変える
                                    this._enemies.forEach((enemy) => {
                                        enemy.changeChasingMode(false); // 逃げモードに変更
                                    });

                                    // パワーアップカウンタ初期化
                                    this._powerUpModeTimer = 500;

                                    // パワーアップモードへ移行
                                    this._state = C.PLAY_POWERUP;
                                }
                            }
                        });

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

                            // 再出現待機モードか？
                            if (enemy.isRespawning()) {
                                enemy.updateRespawnCount(); // カウンタ更新

                                let rc = enemy.getRespawnCount();
                                if (rc < 100) {
                                    // モンスター復活前に点滅させる
                                    let rc2 = Math.trunc(rc / 10);
                                    if (rc2 % 2 === 0) {    // 2で割った余り
                                        enemy.setVisible(true);
                                    } else {
                                        enemy.setVisible(false);
                                    }
                                }
                                if (rc === 0) {
                                    enemy.changeChasingMode(true); // 通常モードに戻す
                                }
                            } else {
                                // 通常モード
                                enemy.move(this._pacman.getPos());
                                enemy.updateSprite();
                            }

                            // 衝突判定
                            if (enemy.detectCollision(this._pacman.getPos())) {
                                // 敵と接触
                                if (enemy.isChasing()) {
                                    // 通常モード
                                    this._pacRest--;
                                    this._restPacman.setValue(this._pacRest);

                                    this._state = C.PLAY_DYING;
                                    this._pacman.startDyingAnim();
                                    break;
                                } else {
                                    // 逃げモード

                                    if (!enemy.isRespawning()) {
                                        // 再出現待機中でなければ点数加算
                                        this._scoreValue += 1000;

                                        this._score.setValue(this._scoreValue);
                                        if (this._scoreValue > this._hiscoreValue) {
                                            // ハイスコア更新
                                            this._hiscoreValue = this._scoreValue;
                                            this._hiScore.setValue(this._hiscoreValue);
                                        }

                                        // このモンスターの新しい位置を計算

                                        // 再出現カウントをセットして待機モードにする
                                        enemy.setRespawnCount(500);
                                        enemy.setVisible(false);
                                    }
                                }
                            }
                        }
                    }

                    // パワーアップモードならタイマー更新
                    // タイマーが切れたら通常モードへ戻す
                    if (this._state === C.PLAY_POWERUP) {
                        if (this._powerUpModeTimer > 0) {
                            // タイマー更新
                            this._powerUpModeTimer--;
                        } else {
                            // タイマー切れた
                            this._powerUpModeTimer = 0;

                            // 通常のキャラ移動に戻す
                            this._enemies.forEach((enemy) => {
                                enemy.changeChasingMode(true); // 通常モードに変更
                            });

                            // 通常モードに戻す
                            this._state = C.PLAY_NORMAL;
                        }
                    }
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

                            // 1面ごとにフルーツを変える
                            // this._fruit.setKindToNext();
                            // this._fruit.setVisible(false);
    
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
                            this.restartStage();
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