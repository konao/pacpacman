// **********************************************
//  スコア
// **********************************************

const { Text } = require('./text');

class Score extends Text {
    constructor(title) {
        super();

        this._score = 0;
        this._title = title;
    }

    clear() {
        this._score = 0;
    }

    getValue() {
        return this._score;
    }

    setValue(score) {
        this._score = score;
        this.update();
    }

    incrValue(dScore) {
        this._score += dScore;
        this.update();
    }

    update() {
        this.setText(`${this._title}: ${this._score}`);
    }
}

module.exports = {
    Score
}