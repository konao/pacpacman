// **********************************************
//  フルーツ
// **********************************************

const { Entity } = require('./entity');
const C = require('./const');
const ST = require('./stage');
const U = require('./utils');

class Fruit extends Entity {
    constructor(kind) {
        super();
        
        // フルーツ種類
        this._kind = kind;

        // スプライトコンテナ
        this._sprs = [];
    }

    // フルーツのスプライトを生成する．
    //
    // スプライトを生成してcontainerとthis._sprsにセットする.
    // フルーツの種類(this._kind)を参照する．
    initSprite(PIXI, container) {
        this._sprs = [];

        let cname = '';
        switch (this._kind) {
            case C.APPLE:
                {
                    cname = 'r';    // red
                    break;
                }
                
            case C.CHERRY:
                {
                    cname = 'p';    // pink
                    break;
                }

            case C.ORANGE:
                {
                    cname = 'g';    // green
                    break;
                }

            case C.BANANA:
                {
                    cname = 'y';    // yellow
                    break;
                }
        }

        for (let i=0; i<4; i++) {
            let sprName = cname + i.toString();
            let m = new PIXI.Sprite(PIXI.Texture.from(sprName));
            m.visible = false;
            container.addChild(m);
            this._sprs.push(m);
        }
    }
}
