// **********************************************
//  テキスト(アルファベット、数字)のスプライト
// **********************************************

class Text {
    constructor() {
        this._textSpr = null;
    }

    initSprite(PIXI, container) {
        let spr = new PIXI.Text(
            '', 
            {
                fontSize: 16,
                fill: 0xffffff
            }
        );

        spr.visible = true;
        container.addChild(spr);
        this._textSpr = spr;

        return this;
    }

    setText(text) {
        if (this._textSpr) {
            this._textSpr.text = text;
        }

        return this;
    }

    setPos(x, y) {
        if (this._textSpr) {
            this._textSpr.x = x;
            this._textSpr.y = y;
        }

        return this;
    }

    setFontSize(size) {
        if (this._textSpr) {
            this._textSpr.style.fontSize = size;
        }

        return this;
    }

    setColor(color) {
        if (this._textSpr) {
            this._textSpr.style.fill = color;
        }

        return this;
    }

    setVisible(bVisible) {
        if (this._textSpr) {
            this._textSpr.visible = bVisible;
        }

        return this;
    }
}

module.exports = {
    Text
}