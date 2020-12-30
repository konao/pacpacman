// **********************************************
//  プレーヤーキャラ（パクパクマン）
// **********************************************

const { Entity } = require('./entity');

// モジュールの公開するシンボルを全部インポートする
// モジュール内の各要素にはC.xxxでアクセスする
const C = require('./const');

// こう書くとモジュール名（上記ではC)を省略できる
// ただしモジュールの公開するシンボルが多くなると他とバッティングの可能性が高まるのでよろしくないかも
// const { IMGW, UP, RIGHT, DOWN, LEFT } = require('./const');

const ST = require('./stage');
const UTL = require('./utils');

// 移動の際、この範囲での差を調整する
// （ぴったり整数値の座標でしか曲がれないのでは操作しにくいため）
const PosAdjustMargin = 0.4;

// ドット食い判定マージン
const EatDotMargin = 0.2;

const MAX_ANIM_COUNT = 6;

// パックマン
class Pacman extends Entity {
    constructor() {
        super();

        // 進行方向
        this._direc = C.NODIR;

        // アニメーションカウント
        this._animCount = 0;

        // スプライトコンテナ
        this._pac = [];

        // 現在のスプライトインデックス
        this._curIdx = -1;

        // 現在のモード（通常、死亡中）
        this._mode = C.PLAY_NORMAL;

        // 死亡アニメーションカウント
        this._dyingAnimCount = 0;

        // 死亡アニメーション用タイマー
        this._dyingAnimTimer = 0;

        // 前回showSpriteの対象となったスプライト
        this._lastIdx = 0;
    }

    getDirec() {
        return this._direc;
    }

    setAnimCount(c) {
        this._animCount = c;
    }

    getAnimCount() {
        return this._animCount;
    }

    getSprIdx() {
        switch (this._mode) {
            case C.PLAY_NORMAL:
                // 進行方向とアニメーションカウントから
                // スプライトインデックスを求める
                {
                    let direc = this._direc;
                    let animCount = this._animCount;

                    if (animCount === 0) {
                        return 0;
                    } else {
                        let base = 0;
                        switch (direc) {
                            case C.UP:
                                base = 1;
                                break;
                            case C.RIGHT:
                                base = 4;
                                break;
                            case C.DOWN:
                                base = 7;
                                break;
                            case C.LEFT:
                                base = 10;
                                break;
                            default:
                                return 0;
                        }
            
                        if (animCount >= 4) {
                            animCount = MAX_ANIM_COUNT - animCount;
                        }
                        return base + (animCount-1);
                    }
                }
            
            case C.PLAY_DYING:
                // 死亡アニメーションカウントから
                // スプライトインデックスを求める
                {
                    const base = 13;
                    return base + this._dyingAnimCount;
                }
            
            default:
                return 0;
        }
    }

    initSprite(PIXI, container) {
        this._pac = [];

        let pacImageNames = [
            'pac00', 
            'pac10', 'pac11', 'pac12',
            'pac20', 'pac21', 'pac22',
            'pac30', 'pac31', 'pac32',
            'pac40', 'pac41', 'pac42',
            "pac_d00", "pac_d01", "pac_d02", "pac_d03", "pac_d04", "pac_d05", "pac_d06", "pac_d07", "pac_d08", "pac_d09"
        ]
        
        for (let imgName of pacImageNames) {
            // PIXI.Texture.fromに与える文字列(ID)はimage/character.jsonに記述されている
            let spr = new PIXI.Sprite(PIXI.Texture.from(imgName));
            spr.visible = (imgName === 'pac00') ? true : false;
            container.addChild(spr);
            this._pac.push(spr);
        }
    }

    updateSprite() {
        if (this._pac.length > 0) {
            let curIdx = this.getSprIdx();
            let pSprite = this._pac[curIdx];

            let px = Math.floor(this._x * C.IMGW);
            let py = Math.floor(this._y * C.IMGW);

            pSprite.x = px;
            pSprite.y = py;
        }
    }

    // @param bUseLastIdx [i] trueのとき、idxに前回showSpriteが呼ばれた時の値を使う
    // 注）なぜこのフラグが必要なのか？
    // ---> パックマンを方向転換させたとき、this._direcがキーを推した瞬間に変わってしまうので、
    // showSprite(false)を行う対象のスプライトが変わってしまい、方向転換前のスプライトが
    // 消えずに残ってしまうため．
    showSprite(bVisible, bUseLastIdx) {
        if (bUseLastIdx) {
            this._pac[this._lastIdx].visible = bVisible;
        } else {
            let curIdx = this.getSprIdx();
            this._pac[curIdx].visible = bVisible;
    
            this._lastIdx = curIdx; // 保存しておく
        }
    }

    updateAnimCount() {
        // アニメーションカウント更新
        this._animCount++;
        if (this._animCount >= MAX_ANIM_COUNT) {
            this._animCount = 0;
        }
    }

    move() {
        if (this._pac.length > 0) {

            // @param direc [i] 方向
            // @param pd {dx, dy} [i] ピクセル単位の変位
            // @param cd {dx, dy} [i] セル単位の変位
            // @param adjustX {boolean} [i] x軸補正を行うか
            // @param adjustY {boolean} [i] y軸補正を行うか
            let moveSub = ((direc, pd, cd, adjustX, adjustY) => {
                let pos = this.getPos();    // 現在のピクセル座標
                let cpos = this.getCellPos();   // 現在のセル座標

                let bCanMove = false;
                if (adjustX) {
                    if (Math.abs(pos.x - cpos.x) < PosAdjustMargin) {
                        // 補正
                        pos = {
                            x: Entity.fromCellPos(cpos).x,  // x座標だけを補正
                            y: pos.y
                        };
                        bCanMove = true;
                    }
                }
                else if (adjustY) {
                    if (Math.abs(pos.y - cpos.y) < PosAdjustMargin) {
                        // 補正
                        pos = {
                            x: pos.x,
                            y: Entity.fromCellPos(cpos).y,  // y座標だけを補正
                        }
                        bCanMove = true;
                    }
                }

                if (bCanMove) {
                    let nextPos = Entity.d(pos, pd); // 移動先のピクセル座標
                    let nextCPos = Entity.d(cpos, cd); // 一つ上のセル座標

                    let nextChar = this._stage.get(nextCPos.x, nextCPos.y);

                    // console.log(`pos=(${pos.x}, ${pos.y}), nextPos=(${nextPos.x}, ${nextPos.y})`);
                    // console.log(`cpos=(${cpos.x}, ${cpos.y}), nextCPos=(${nextCPos.x}, ${nextCPos.y}) ---> ${nextChar}`);

                    let moved = false;
                    if (nextChar !== ST.WALL) {
                        // 進む先は壁ではないので、進める
                        this.setPos(nextPos);
                        moved = true;
                    } else {
                        switch (direc) {
                            case C.UP:
                            case C.DOWN:
                                {
                                    if (nextChar === ST.WALL && !UTL.isFracZero(pos.y)) {
                                        // 進む先は壁だが、まだ壁に到達していない場合も、進める
                                        this.setPos(nextPos);
                                        moved = true;
                                    }
                                }
                                break;
                            
                            case C.RIGHT:
                            case C.LEFT:
                                {
                                    if (nextChar === ST.WALL && !UTL.isFracZero(pos.x)) {
                                        // 進む先は壁だが、まだ壁に到達していない場合も、進める
                                        this.setPos(nextPos);
                                        moved = true;
                                    }
                                }
                                break;
                        }
                    }

                    if (moved) {
                        // 現在のパックマンスプライトを表示offにする
                        // offにするスプライトは、前回showSprite(true)を行ったもの
                        this.showSprite(false, true);

                        // アニメーションカウント更新
                        this.updateAnimCount();

                        // 新しいパックマンスプライトを表示onにする
                        this.showSprite(true);
                    }
                }
            }).bind(this);

            switch (this._direc) {
                case C.UP: {
                    moveSub(
                        C.UP,
                        {dx:0, dy:-0.2},
                        {dx:0, dy:-1},
                        true, false
                    );
                    break;
                }

                case C.RIGHT: {
                    moveSub(
                        C.RIGHT,
                        {dx:0.2, dy:0},
                        {dx:1, dy:0},
                        false, true
                    );
                    break;
                }

                case C.DOWN: {
                    moveSub(
                        C.DOWN,
                        {dx:0, dy:0.2},
                        {dx:0, dy:1},
                        true, false
                    );
                    break;
                }

                case C.LEFT: {
                    moveSub(
                        C.LEFT,
                        {dx:-0.2, dy:0},
                        {dx:-1, dy:0},
                        false, true
                    );
                    break;
                }
            }

            this.updateSprite();
        }
    }

    // 衝突判定
    detectCollision(stage) {
        let eatCount = 0;

        let x = this._x;
        let y = this._y;

        let cx = Math.round(x);
        let cy = Math.round(y);

        if ((Math.abs(x-cx) < EatDotMargin) &&
            (Math.abs(y-cy) < EatDotMargin)) {
                // 各セルの基準点に十分近い距離に入った．
                // (cx, cy)にドットがあれば、ドットを食べたこととする．
                let value = stage.get(cx, cy);
                if (value === ST.DOT) {
                    let dotSpr = stage.getSpr(cx, cy);
                    if (dotSpr && dotSpr.visible) {
                        eatCount++;
                        dotSpr.visible = false;
                    }
                }
            }
        
        return eatCount;
    }

    // 死亡アニメーション開始
    startDyingAnim() {
        // 現在のスプライトを非表示にする
        this.showSprite(false);

        // モードを変更
        this._mode = C.PLAY_DYING;

        // 死亡アニメーションカウンタをリセット
        this._dyingAnimCount = 0;
        this._dyingAnimTimer = 0;

        this.updateSprite();
        
        // 新しいパックマンスプライトを表示onにする
        this.showSprite(true);
    }

    // 死亡アニメーション終了
    stopDyingAnim() {
        // 現在のスプライトを非表示にする
        this.showSprite(false);

        // モードを元に戻す
        this._mode = C.PLAY_NORMAL;

        // 死亡アニメーションカウンタをリセット
        this._dyingAnimCount = 0;
    }

    doDyingAnim() {
        this._dyingAnimTimer++;
        if (this._dyingAnimTimer >= 10) {
            this._dyingAnimTimer = 0;

            // 現在のスプライトを非表示にする
            this.showSprite(false);

            // カウンタ更新
            this._dyingAnimCount++;
            if (this._dyingAnimCount >= 10) {
                this._dyingAnimCount = 0;
                return false;   // 返り値がfalseならアニメーション終了
            }

            // 新しいパックマンスプライトの位置を更新＆表示onにする
            this.updateSprite();
            this.showSprite(true);
        }

        return true;
    }
}

module.exports = {
    Pacman
}