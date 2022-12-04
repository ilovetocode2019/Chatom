
const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

const APP_URL = isDev ? 'http://localhost:3000' : 'https://chatom.app'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Chatom',
    autoHideMenuBar: true,
    backgroundColor: '#121212',
    webPreferences: {
      devTools: false
    }
  });

  mainWindow.loadURL(APP_URL);

  if (process.platform === 'win32') {
      app.setAppUserModelId(mainWindow.title);
  }

  mainWindow.webContents.on('did-fail-load', () => {
    const result = dialog.showMessageBoxSync(mainWindow, {
      'message': 'Failed to load web client. Make sure you\'re connected to the internet.',
      'buttons': ['Close', 'Retry'],
      'title': 'Network Error',
      'noLink': true
    });

    if (result === 0) {
      app.quit();
    } else if (result === 1) {
      mainWindow.loadURL(APP_URL);
    }
  });

}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

});

app.on('window-all-closed', () => {
  app.quit();
});
