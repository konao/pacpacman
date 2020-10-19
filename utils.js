const C = require('./const');

const EPSILON = 1e-5;

const randDouble = (x) => {
    return Math.random() * x;
}

const randInt = (x) => {
    return Math.trunc(Math.random() * x);
}

// xが整数ならtrue．小数点部分があるならfalse
// eplisionで微妙な誤差でおかしくなることを防ぐ
//
// @param x {number}
const isFracZero = (x) => {
    return (Math.abs(x - Math.round(x)) < EPSILON);
}

// 実数として等しいか
const isEqual = (x, y) => {
    return (Math.abs(x-y) < EPSILON);
}

// 方向識別子から変位{dx, dy}を返す
const dir2dxdy = (direc) => {
    switch (direc) {
        case C.UP:
            return {dx: 0, dy: -1};
        case C.DOWN:
            return {dx: 0, dy: 1};
        case C.LEFT:
            return {dx: -1, dy: 0};
        case C.RIGHT:
            return {dx: 1, dy: 0};
        default:
            return {dx: 0, dy: 0};
    }
}

module.exports = {
    randDouble,
    randInt,
    isFracZero,
    isEqual,
    dir2dxdy
}