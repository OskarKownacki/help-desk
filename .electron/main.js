"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const isDev = process.env.NODE_ENV === 'development';
// Register your app as the handler for your custom protocol
electron_1.app.setAsDefaultProtocolClient('helpdesk');
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path_1.default.join(__dirname, '../out/index.html'));
    }
}
function handleAuthCallback(url) {
    const win = electron_1.BrowserWindow.getAllWindows()[0];
    if (!win)
        return;
    const queryString = url.split('?')[1];
    if (isDev) {
        win.loadURL(`http://localhost:3000/auth/callback?${queryString}`);
    }
    else {
        win.loadFile(path_1.default.join(__dirname, '../out/auth/callback.html'), {
            query: Object.fromEntries(new URLSearchParams(queryString)),
        });
    }
}
electron_1.app.whenReady().then(() => {
    createWindow();
    // macOS: handle deep link when app is already open
    electron_1.app.on('open-url', (event, url) => {
        event.preventDefault();
        handleAuthCallback(url);
    });
});
// Windows/Linux: handle deep link via process.argv when app is launched fresh
const gotLock = electron_1.app.requestSingleInstanceLock();
if (!gotLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', (_event, argv) => {
        const url = argv.find((arg) => arg.startsWith('helpdesk://'));
        if (url)
            handleAuthCallback(url);
        // Focus the existing window
        const win = electron_1.BrowserWindow.getAllWindows()[0];
        if (win) {
            if (win.isMinimized())
                win.restore();
            win.focus();
        }
    });
}
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
