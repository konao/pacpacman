// **********************************************
//  フルーツ
// **********************************************

const { Entity } = require('./entity');
const C = require('./const');
const ST = require('./stage');
const U = require('./utils');

class Fruit extends Entity {
    constructor() {
        super();
        
        // フルーツ種類
        this._kind = 0;

        // スプライトコンテナ
        this._sprs = [];

        // 表示中フラグ
        this._visible = false;

        // 表示カウント
        this._showCount = 0;
    }

    // フルーツのスプライトを生成する．
    //
    // スプライトを生成してcontainerとthis._sprsにセットする.
    // フルーツの種類(this._kind)を参照する．
    initSprite(PIXI, container) {
        this._sprs = [];

        for (let i=0; i<8; i++) {
            let sprName = 'fruit_' + i.toString();
            console.log(sprName);
            let m = new PIXI.Sprite(PIXI.Texture.from(sprName));
            m.visible = false;
            this._visible = false;
            container.addChild(m);
            this._sprs.push(m);
        }

        this._kind = 0;
    }

    updateSprite() {
        if (this._sprs.length > 0) {
            let pSprite = this._sprs[this._kind];

            let px = Math.floor(this._x * C.IMGW);
            let py = Math.floor(this._y * C.IMGW);

            pSprite.x = px;
            pSprite.y = py;
        }
    }

    setKind(kind) {
        this._kind = kind;
    }

    setVisible(bVisible) {
        if (this._kind >= 0) {
            let pSprite = this._sprs[this._kind];
            if (pSprite) {
                pSprite.visible = bVisible;
                this._visible = bVisible;
            }
        }
    }

    getVisible() {
        return this._visible;
    }

    initShowCount() {
        this._showCount = 50;
    }

    updateShowCount() {
        if (this._visible) {
            this._showCount--;
            if (this._showCount<=0) {
                this.setVisible(false);
                this._showCount = 0;
            }
        }
    }
}

module.exports = {
    Fruit
}