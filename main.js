const { app, BrowserWindow } = require("electron");
const path = require("path");
let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1480,
        height: 1024,
        useContentSize: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadURL(`file://${__dirname}/index.html`);
    win.on("closed", ()=>{win=null;});
}
app.on("ready", createWindow);
app.on("window-all-closed", ()=>{
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", ()=>{
    if (win === null) {
        createWindow();
    }
});
