import http from "http";
import {app, BrowserWindow, dialog, ipcMain} from 'electron';
import 'dotenv/config';
import fs from "fs/promises";
const REACT_URL = process.env.REACT_URL;
const CHECK_INTERVAL = 2000;

function createWindow() {
    const win = new BrowserWindow({
        frame: true,
        webPreferences: {
            preload: "./preload.js",
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    win.removeMenu();
    win.maximize();
    win.loadURL(REACT_URL).catch(() => {});

    win.webContents.on('did-finish-load', () => {
        win.webContents.openDevTools({ mode: 'detach' });
    });
}

function waitForReactServer(cb) {
    const req = http.request(REACT_URL, res => {
        console.log(`React server ready (status ${res.statusCode})`);
        cb();
    });
    req.on('error', () => {
        console.log(`Server connection failed, waiting for reconnection...`);
        setTimeout(() => waitForReactServer(cb), CHECK_INTERVAL);
    });
    req.end();
}

app.whenReady().then(() => {
    console.log('App ready, waiting for React server...');
    waitForReactServer(createWindow);
});

ipcMain.handle('show-open-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: '파일 선택',
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    });
    if (canceled || filePaths.length === 0) {
        return null;
    }
    const filePath = filePaths[0];
    try {
        const stats = await fs.stat(filePath);
        return {
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
        };
    } catch (err) {
        return { error: err.message };
    }
});