// **********************************************
//  数値のスプライト
// **********************************************

const { Text } = require('./text');

class Number extends Text {
    constructor(title) {
        super();

        this._value = 0;
        this._title = title;
    }

    clear() {
        this._value = 0;
    }

    getValue() {
        return this._value;
    }

    setValue(value) {
        this._value = value;
        this.update();
    }

    incrValue(dValue) {
        this._value += dValue;
        this.update();
    }

    update() {
        this.setText(`${this._title}: ${this._value}`);
    }
}

module.exports = {
    Number
}