import { app, BrowserWindow } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

// Register your app as the handler for your custom protocol
app.setAsDefaultProtocolClient('helpdesk');

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../out/index.html'));
  }
}

function handleAuthCallback(url: string): void {
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return;

  const queryString = url.split('?')[1];
  if (isDev) {
    win.loadURL(`http://localhost:3000/auth/callback?${queryString}`);
  } else {
    win.loadFile(path.join(__dirname, '../out/auth/callback.html'), {
      query: Object.fromEntries(new URLSearchParams(queryString)),
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  // macOS: handle deep link when app is already open
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleAuthCallback(url);
  });
});

// Windows/Linux: handle deep link via process.argv when app is launched fresh
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const url = argv.find((arg) => arg.startsWith('helpdesk://'));
    if (url) handleAuthCallback(url);

    // Focus the existing window
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});