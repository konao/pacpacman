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

        // スコア
        this._score = null;

        // ステージ
        this._stage = null;

        // パックマン
        this._pacman = null;

        // 敵
        this._enemies = [];
    }

    initStage() {
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
        const nEnemies = 10; // ****** モンスターの数 ******
        let wps = this._stage.getRandomWayPoints(nEnemies);
        for (let i=0; i<nEnemies; i++) {
            let kind = Utils.randInt(4);
            let enemy = new Enemy(kind);
            enemy.setPos(wps[i]);
            console.log(`[${i}] pos=(${wps[i].x}, ${wps[i].y})`);
            enemy.setDirec(C.NODIR);
            enemy.setStage(this._stage);
            this._enemies.push(enemy);
        }

        this._score = new Score('Score');
        this._hiScore = new Score('Hi-Score');
    }

    // @param PIXI [i] PIXIオブジェクト
    // @param container [i] PIXI.containerオブジェクト
    initSprites(PIXI, container) {
        this._container = new PIXI.Container();

        // stageに対応するスプライト生成
        console.log(`stage=${this._stage}`);
        this._stage.initSprite(PIXI, this._container);

        // pacmanスプライト生成
        this._pacman.initSprite(PIXI, this._container);

        // 敵スプライト生成
        for (let i=0; i<this._enemies.length; i++) {
            this._enemies[i].initSprite(PIXI, this._container);
        }

        this._hiScore.initSprite(PIXI, this._container);
        this._hiScore.setPos(1150, 100);
        this._hiScore.setFontSize(30);
        this._hiScore.setValue(38000);

        this._score.initSprite(PIXI, this._container);
        this._score.setPos(1150, 20);
        this._score.setFontSize(30);
        this._score.setValue(1200);

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
                    console.log('Captured!!');
                }
            }
        }
    }
}

module.exports = {
    GameScene
}