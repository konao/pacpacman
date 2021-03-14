// **********************************************
//  敵（モンスター）
// **********************************************

const { Entity } = require('./entity');
const C = require('./const');
const ST = require('./stage');
const U = require('./utils');

class Enemy extends Entity {
    constructor(kind) {
        super();
        
        // モンスター種類
        this._kind = kind;

        // 進行方向
        this._direc = C.NODIR;

        // アニメーションカウント
        this._animCount = 0;

        // スプライトコンテナ（追いかけ）
        this._chaseingSprs = [];

        // スプライトコンテナ（逃げ）
        this._escapeingSprs = [];

        // 追いかけモードか？
        this._isChasing = true;

        // 現在のスプライトインデックス
        // this._curIdx = -1;

        // 移動目標点
        this._dest = {x: 0, y: 0};
    }

    setDirec(direc) {
        this._direc = direc;
    }

    getDirec() {
        return this._direc;
    }

    changeChasingMode(bChasing) {
        this._isChasing = bChasing; // モードを変える

        // 現在のモードのスプライトの表示状態をセット
        let sprs = this.getSprs();
        if (sprs.length > 0) {
            sprs.forEach(spr => {
                spr.visible = false;
            });

            let curIdx = this.getSprIdxFromDir(this._direc);
            if (curIdx >= 0) {
                let pSprite = sprs[curIdx];
                pSprite.visible = true;
            }
        }

        // 反対のモードのスプライトは全部消す
        let otherSprs = this.getSprs(!this.isChasing());
        if (otherSprs.length > 0) {
            otherSprs.forEach(spr => {
                spr.visible = false;
            });
        }
    }

    isChasing() {
        return this._isChasing;
    }

    getSprs(bChasing = this._isChasing) {   // これOK?
        return (bChasing) ? this._chaseingSprs : this._escapeingSprs;
    }

    // モンスターのスプライトを生成する．
    //
    // スプライトを生成してcontainerとthis._sprsにセットする.
    // モンスターの種類(this._kind)を参照する．
    initSprite(PIXI, container) {
        this._chaseingSprs = [];
        this._escapeingSprs = [];

        let cname = '';
        switch (this._kind) {
            case C.AKEBEE:
                {
                    cname = 'r';    // red
                    break;
                }
                
            case C.PINKY:
                {
                    cname = 'p';    // pink
                    break;
                }

            case C.MIDSUKE:
                {
                    cname = 'g';    // green
                    break;
                }

            case C.GUZUTA:
                {
                    cname = 'y';    // yellow
                    break;
                }
        }

        // 追いかけスプライト
        for (let i=0; i<4; i++) {
            let sprName = cname + i.toString();
            let m = new PIXI.Sprite(PIXI.Texture.from(sprName));
            m.visible = false;
            container.addChild(m);
            this._chaseingSprs.push(m);
        }

        // 逃げスプライト
        for (let i=0; i<4; i++) {
            let sprName = 'b' + i.toString();
            let m = new PIXI.Sprite(PIXI.Texture.from(sprName));
            m.visible = false;
            container.addChild(m);
            this._escapeingSprs.push(m);
        }
    }

    setVisible(bVisible) {
        let curIdx = this.getSprIdxFromDir(this._direc);
        if (curIdx >= 0) {
            let sprs = this.getSprs();
            let pSprite = sprs[curIdx];
            if (pSprite) {
                pSprite.visible = bVisible;
            }
        }
    }

    // 進行方向からスプライトインデックスを求める
    getSprIdxFromDir(direc) {
        switch (direc) {
            case C.UP:
                return 0;
            case C.RIGHT:
                return 1;
            case C.DOWN:
                return 2;
            case C.LEFT:
                return 3;
            default:
                return -1;  // ここには来ないはず
        }
    }

    // @param pacPos [i] パックマンの位置
    // @param bPowerupMode [i] true=パワーアップモード, false=通常モード
    move(pacPos, bPowerupMode) {
        let sprs = this.getSprs();

        // console.log(`move (${this._x}, ${this._y})`);
        if (this._direc == C.NODIR) {
            // 移動方向が決まっていない

            // 移動目標点を計算
            let dp = this.calcDestPoint(pacPos, bPowerupMode);
            if (dp) {
                // console.log(`[1] dp=(direc=${dp.direc}, x=${dp.x}, y=${dp.y}`);

                this._direc = dp.direc;
                this._dest = {
                    x: dp.x,
                    y: dp.y
                };
            }
        } else {
            // 移動方向に向けて移動
            let d = U.dir2dxdy(this._direc);

            this._x = this._x + d.dx * 0.1;
            this._y = this._y + d.dy * 0.1;

            // 目標点に達したか？
            // console.log(`(${this._x}, ${this._y}) - dest=(${this._dest.x}, ${this._dest.y})`);
            if (U.isEqual(this._x, this._dest.x) && U.isEqual(this._y, this._dest.y)) {
                // 移動目標点再計算
                let dp = this.calcDestPoint(pacPos, bPowerupMode);
                if (dp) {
                    // console.log(`[2] dp=(direc=${dp.direc}, x=${dp.x}, y=${dp.y}`);

                    // 今まで表示していたスプライトの表示フラグをoffにする
                    let curIdx = this.getSprIdxFromDir(this._direc);
                    if (curIdx >= 0) {
                        let pSprite = sprs[curIdx];
                        if (pSprite) {
                            pSprite.visible = false;
                        }
                    }        

                    this._direc = dp.direc;
                    this._dest = {
                        x: dp.x,
                        y: dp.y
                    };

                    // 新しいスプライトの表示フラグをonにする
                    curIdx = this.getSprIdxFromDir(this._direc);
                    if (curIdx >= 0) {
                        let pSprite = sprs[curIdx];
                        if (pSprite) {
                            pSprite.visible = true;
                        }
                    }        
                }
            }
        }
    }

    // 現在の位置(this._x, this._y)から、パックマンの位置(pacPos)に到達するために
    // 移動するべき目標点と進行方向を返す
    // bPowerupMode=trueの時、パワーアップモード
    //
    // @return {
    //    x,    // 目標点
    //    y,
    //    direc // 進行方向
    // }
    calcDestPoint(pacPos, bPowerupMode) {
        // 全方向
        const alldirec = [C.UP, C.RIGHT, C.DOWN, C.LEFT];

        // 進める方向の候補のリスト
        // リストの要素の内容は以下の通り
        // direc: 方向
        // dist2: ウェイポイントからパックマンまでの距離（の2乗）
        // destPos: 目標点
        let cands = [];

        // 現在のセル位置
        let cp = this.getCellPos();

        for (let direc of alldirec) {
            let d = U.dir2dxdy(direc);

            // 隣のセルの位置
            let nx = cp.x + d.dx;
            let ny = cp.y + d.dy;

            // 隣が壁でなければ進める
            if (this._stage.get(nx, ny) !== ST.WALL) {
                cands.push({
                    direc: direc,
                    dist2: 0,
                    destPos: {x: 0, y:0}
                });
            }
        }

        for (let cand of cands) {
            // diercから変位を計算 --> d
            let d = U.dir2dxdy(cand.direc);

            let px = cp.x;
            let py = cp.y;

            while (true) {
                px += d.dx;
                py += d.dy;

                if (this._stage.get(px, py) === ST.WALL) {
                    // 壁に当たったらこの方向は候補から外す
                    cand.dist2 = -1;
                    break;
                }
                else {
                    if (this._stage.isWayPoint(px, py)) {
                        // (px, py)はウェイポイント
                        // そこからパックマンまでの距離を計算
                        let dx = pacPos.x - px;
                        let dy = pacPos.y - py;
                        let dist2 = (dx*dx)+(dy*dy);

                        cand.dist2 = dist2;
                        cand.destPos = {x: px, y: py};
                        break;
                    }
                }
            }
        }

        let retVal = null;

        if (U.randDouble(1.0) < 0.2) {
            // ランダムに方向を選ぶ
            // console.log('random');
            let ind = U.randInt(cands.length);
            let cand = cands[ind];
            retVal = {
                x: cand.destPos.x,
                y: cand.destPos.y,
                direc: cand.direc
            }
        } else {
            let updateDistp = null; // 距離を更新するか？を判断する関数
            if (!bPowerupMode) {
                // 通常モード
                // パックマンに最も近い方向を選ぶ
                updateDistp = (newDist, dist) => {
                    return (newDist < dist);
                }
            } else {
                // パワーアップモード
                // パックマンから最も遠い方向を選ぶ
                updateDistp = (newDist, dist) => {
                    return (newDist > dist);
                }
            }

            let dist = -1;   
            for (let cand of cands) {
                if (cand.dist2 > 0) {
                    if (dist < 0 || updateDistp(cand.dist2, dist)) {
                        dist = cand.dist2;
                        retVal = {
                            x: cand.destPos.x,
                            y: cand.destPos.y,
                            direc: cand.direc
                        }
                    }
                }
            }
        }
        
        return retVal;
    }

    updateSprite() {
        let sprs = this.getSprs();
        if (sprs.length > 0) {
            let curIdx = this.getSprIdxFromDir(this._direc);
            if (curIdx >= 0) {
                let pSprite = sprs[curIdx];

                let px = Math.floor(this._x * C.IMGW);
                let py = Math.floor(this._y * C.IMGW);
    
                pSprite.x = px;
                pSprite.y = py;
            }
        }
    }
}

module.exports = {
    Enemy
}