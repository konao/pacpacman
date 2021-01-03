// **********************************************
//  ステージ（マップ）
// **********************************************

const Utils = require('./utils');
const { IMGW } = require('./const');

const SPACE = 0;
const WALL = 1;
const DOT = 2;
const POWER_FOOD = 3;

class Stage {
    constructor() {
        this._stage = null; // this._stage[y][x]の順で格納されている
        this._sprs = null;  // this._sprs[y][x]の順で格納されている
        this._w = 0;    // ステージの幅
        this._h = 0;    // ステージの高さ

        // ウェイポイントの配列
        // _wps=[(wx, wy)]  (wx, wy)がウェイポイント
        this._wps = [];
    }

    getSize() {
        return {
            w: this._w,
            h: this._h
        };
    }

    // @param x [i] 0<=x<this._w
    // @param y [i] 0<=y<this._h
    //
    // @return (x, y)にあるもの
    // 範囲オーバーの時はWALLを返す
    get(x, y) {
        if ((x<0) || (x>=this._w) ||
            (y<0) || (y>=this._h)) {
                return WALL;
        }

        return this._stage[y][x];
    }

    getSpr(x, y) {
        if ((x<0) || (x>=this._w) ||
            (y<0) || (y>=this._h)) {
                return null;
        }

        return this._sprs[y][x];
    }

    setSpr(x, y, spr) {
        if ((x<0) || (x>=this._w) ||
            (y<0) || (y>=this._h)) {
                return;
        }

        this._sprs[y][x] = spr;
    }

    // @param edgeLen [i] 1つの正方形ブロックの辺の長さ
    // @param wc [i] 幅方向カウント（正方形ブロックの個数）
    // @param hc [i] 高さ方向カウント（正方形ブロックの個数）
    // 
    // ステージの幅(w)は(edgeLen+1)*wc+3
    // ステージの高さ(h)は(edgeLen+1)*hc+3
    // になる．
    generate(edgeLen, wc, hc) {
        let w = (edgeLen+1)*wc+3;
        let h = (edgeLen+1)*hc+3;
        this._w = w;
        this._h = h;
        this._stage = new Array(h).fill(null);
        for (let i=0; i<h; i++) {
            this._stage[i] = new Array(w).fill(SPACE);
        }
        this._sprs = new Array(h).fill(null);
        for (let i=0; i<h; i++) {
            this._sprs[i] = new Array(w).fill(null);
        }

        // 内側基本ブロック
        for (let i=0; i<hc; i++) {
            let pivotY = (edgeLen+1)*i+2;
            for (let j=0; j<wc; j++) {
                let pivotX = (edgeLen+1)*j+2;
                for (let dx=0; dx<edgeLen; dx++) {
                    let x=pivotX+dx;                    
                    for (let dy=0; dy<edgeLen; dy++) {
                        let y=pivotY+dy;
                        this._stage[y][x] = WALL;  // -1=壁
                    }
                }
            }
        }

        // 乱数でブロック間をつなげる壁を作る
        for (let i=0; i<hc; i++) {
            let pivotY = (edgeLen+1)*i+2;
            for (let j=0; j<wc; j++) {
                let pivotX = (edgeLen+1)*j+2;
                // 右横の通路を壁で埋めるか？
                if ((j!==wc-1) && Utils.randDouble(1.0) < 0.2) {
                    for (let dy=0; dy<edgeLen; dy++) {
                        let x=pivotX+edgeLen;
                        let y=pivotY+dy;
                        this._stage[y][x] = WALL;
                    }
                }

                // 下の通路を壁で埋めるか？
                if ((i!==hc-1) && Utils.randDouble(1.0) < 0.2) {
                    for (let dx=0; dx<edgeLen; dx++) {
                        let x=pivotX+dx;
                        let y=pivotY+edgeLen;
                        this._stage[y][x] = WALL;
                    }
                }
            }
        }

        // 周りの壁作成
        for (let i=0; i<h; i++) {
            this._stage[i][0] = WALL;
            this._stage[i][w-1] = WALL;
        }
        for (let j=0; j<w; j++) {
            this._stage[0][j] = WALL;
            this._stage[h-1][j] = WALL;
        }

        // 空いている空白をドットに変える
        for (let i=0; i<h; i++) {
            for (let j=0; j<w; j++) {
                if (this._stage[i][j] === SPACE) {
                    this._stage[i][j] = DOT;
                }
            }
        }
    }

    // ドットの数を数える
    //
    // @return ステージにあるドットの数
    countDots() {
        let nDots = 0;

        for (let i=0; i<this._h; i++) {
            for (let j=0; j<this._w; j++) {
                if (this._stage[i][j] === DOT) {
                    nDots++;
                }
            }
        }

        return nDots;
    }

    print() {
        console.log(`w=${this._w}, h=${this._h}`);
        for (let i=0; i<this._h; i++) {
            // 行番号を先頭に書く（3桁でゼロサプレス）
            let s = i.toString().padStart(3, '0') + ' ';
            s += this._stage[i].map(x => {
                switch (x) {
                    case SPACE:
                        return ' ';
                    case DOT:
                        return '.';
                    case POWER_FOOD:
                        return 'o';
                    case WALL:
                        return '*';
                    default:
                        return ' ';
                }
            }).join('');
            console.log(s);
        }
    }

    // stageに対応するスプライト生成
    initSprite(PIXI, container) {
        let stageSize = this.getSize();
        for (let y=0; y<stageSize.h; y++) {
            for (let x=0; x<stageSize.w; x++) {
                let e = this.get(x, y);
                let spr = null;
                switch (e) {
                    case WALL:
                        spr = new PIXI.Sprite(PIXI.Texture.from('wall'));
                        break;
                    case DOT:
                        spr = new PIXI.Sprite(PIXI.Texture.from('dot'));
                        this.setSpr(x, y, spr);    // ドットスプライトを登録
                        break;
                }
    
                if (spr) {
                    spr.x = x*26;
                    spr.y = y*26;
        
                    container.addChild(spr);
                    this.setSpr(x, y, spr);
                }
            }
        }
    }

    // 追跡用ルートマップ作製
    calcRouteMap() {
        // ＜アルゴリズム＞
        //
        // (1) ウェイポイントを生成
        // ウェイポイントとは曲がり角のこと
        //
        // (2) 2つのウェイポイント間の移動方向を計算
        // sp=(sx, sy) --> dp=(dx, dy)へ向かう際の変位を計算する
        // これをマップで保持しておけよよい
        // map(sp, dp) --> d
    }

    // マップ上のすべてのウェイポイントを探し出す
    searchAllWayPoints() {
        this._wps = [];

        for (let y=1; y<this._h-1; y++) {
            for (let x=1; x<this._w-1; x++) {
                if (this.isWayPoint(x, y)) {
                    this._wps.push({x:x, y:y});
                }
            }
        }

        // debug
        let nwps = this._wps.length;
        // console.log(`total waypoints=${nwps}`);
        for (let i=0; i<nwps; i++) {
            let wp = this._wps[i];
            // console.log(`[${i}], (${wp.x}, ${wp.y})`);
        }
    }

    // (x, y)がウェイポイントかどうか判定する
    //
    // (x, y)がウェイポイント ≡ (x, y)が道の途中でない時のこと．
    //
    // 道の途中とは、(x, y)から伸びている道が上下または左右の両方向しかないときである．
    isWayPoint(x, y) {
        if (this.get(x, y)===WALL) return false;    // (x, y)が壁ならそもそも論外

        // 上下左右の状態を得る
        let upStat = this.get(x, y-1);
        let downStat = this.get(x, y+1);
        let leftStat = this.get(x-1, y);
        let rightStat = this.get(x+1, y);

        if ((upStat!==WALL) && (downStat!==WALL) &&
            (leftStat===WALL) && (rightStat===WALL)) {
                // 上下は壁でなく、左右は壁
                // ---> (x, y)は道の途中
                return false;
        }
        else if ((upStat===WALL) && (downStat===WALL) &&
            (leftStat!==WALL) && (rightStat!==WALL)) {
                // 上下は壁、左右は壁でない
                // ---> (x, y)は道の途中
                return false;
        }
        
        return true;    // (x, y)はウェイポイント
    }

    // (cx, cy)に最も近いウェイポイントを返す
    //
    // return (nx, ny) ... (cx, cy)に最も近いウェイポイント
    // getNearestWayPoint(cx, cy) {
    //     let minDist2 = -1;
    //     let nearestPt = {x: 0, y: 0};
    //     let nwps = this._wps.length;
    //     for (let i=0; i<nwps; i++) {
    //         let wp = this._wps[i];

    //         // 距離の2乗
    //         let dist2 = (cx-wp.x)*(cx-wp.x) + (cy-wp.y)*(cy-wp.y);

    //         if (minDist2 < 0) {
    //             // 最初
    //             minDist2 = dist2;
    //             nearestPt = wp;
    //             console.log(`(${nearestPt.x}, ${nearestPt.y}) : dist2=${dist2}`);
    //         }
    //         else if (dist2 < minDist2) {
    //             // より近い点を発見
    //             minDist2 = dist2;
    //             nearestPt = wp;
    //             console.log(`(${nearestPt.x}, ${nearestPt.y}) : dist2=${dist2}`);
    //         }
    //     }
    //     return nearestPt;
    // }

    getRandomWayPoints(n) {
        let randWps = [];
        let nWayPoints = this._wps.length;
        for (let i=0; i<n; i++) {
            let ind = Utils.randInt(nWayPoints);
            randWps.push(this._wps[ind]);
        }
        return randWps;
    }
}

module.exports = {
    Stage,
    SPACE,
    DOT,
    POWER_FOOD,
    WALL
}