// **********************************************
//  シーンベースクラス
// **********************************************

const PIXI = require('pixi.js');

class BaseScene {
    init(PIXI, container) {
    }

    onUpPressed() {
    }

    onDownPressed() {
    }

    onLeftPressed() {
    }

    onRightPressed() {
    }

    onSpacePressed() {
    }

    // 各モードクラスはここで処理を行う
    //
    // モードを変更する場合は、返り値に新しいモードの識別子を返す
    // そうでない場合はnullを返す
    update() {
        return null;
    }

    cleanUp() {
    }
}

module.exports = {
    BaseScene
}