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
            container.addChild(m);
            this._sprs.push(m);
        }

        this._kind = 0;
    }

    setKind(kind) {
        this._kind = kind;
    }

    setVisible(bVisible) {
        if (this._kind >= 0) {
            let pSprite = this._sprs[this._kind];
            if (pSprite) {
                pSprite.visible = bVisible;
            }
        }
    }
}

module.exports = {
    Fruit
}