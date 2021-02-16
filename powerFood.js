// **********************************************
//  パワーえさ
// **********************************************

const { Entity } = require('./entity');
const C = require('./const');
const ST = require('./stage');
const U = require('./utils');

class PowerFood extends Entity {
    constructor() {
        super();
        
        // スプライト
        this._spr = null;

        // 有効フラグ
        // (true=食べられていない, false=すでに食べられた）
        this._valid = true;

        // 表示中フラグ
        this._visible = false;

        // 表示カウント
        this._showCount = 0;
    }

    setValid(bValid) {
        this._valid = bValid;
    }

    getValid() {
        return this._valid;
    }

    // パワーえさのスプライトを生成する．
    //
    // スプライトを生成してcontainerとthis._sprにセットする.
    initSprite(PIXI, container) {
        let m = new PIXI.Sprite(PIXI.Texture.from('powerFood'));
        m.visible = false;
        this._visible = false;
        container.addChild(m);
        this._spr = m;
    }

    updateSprite() {
        if (this._spr) {
            let px = Math.floor(this._x * C.IMGW);
            let py = Math.floor(this._y * C.IMGW);

            this._spr.x = px;
            this._spr.y = py;
        }
    }

    setVisible(bVisible) {
        if (this._spr) {
            this._spr.visible = bVisible;
            this._visible = bVisible;
        }
    }

    getVisible() {
        return this._visible;
    }

    updateShowCount() {
        this._showCount++;
        if (this._showCount > 15) {
            this._showCount = 0;

            let flg = !this._visible;
            this.setVisible(flg);
        }
    }
}

module.exports = {
    PowerFood
}