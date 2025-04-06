# ビルド＆実行方法

2025/4/6

おニューの環境(Surface Pro 9)に以降したら動かなくなったのでビルド＆実行方法を再度調べた．
ついでにパッケージングの方法も書いておく
（copilot？が勝手に候補を出してくれてその通りにやったらうまくいってしまった）ｗ

## ビルド

```
cd このディレクトリ
npm install -D electron
npm install -D electron-packager  <=== パッケージングする際に必要
```

package.jsonの"scripts"に"start"と"build"項を追加

```
  "scripts": {
    "start": "electron .",  <=== これを追加
    "build": "electron-packager . --overwrite --platform=win32 --arch=x64 --out=release-builds --icon=icon.ico",  <=== これを追加
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

## 実行

```
npm run start
```

注）コマンドラインでダイレクトに`electron .`とやっても起動しない
（パスに入っていないかららしい．electronの実行形式は`node_modules\.bin`にある）

## パッケージング

```
npm run build
```

成功すると`release-builds/ex1-win32-x64`に`exe`ができる．
