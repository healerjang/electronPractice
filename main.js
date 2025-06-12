import http from "http";
import {app, BrowserWindow, dialog, ipcMain} from 'electron';
import 'dotenv/config';
import fs from "fs/promises";
const REACT_URL = process.env.REACT_URL;
const CHECK_INTERVAL = 2000;
import { isCreateTable, createAllTables } from './SQL/createTable.js';
import {dropAllTables} from "./SQL/util.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        frame: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
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

app.whenReady().then(async () => {
    console.log('App ready, waiting for React server...');
    try {
        // await dropAllTables();
        const exists = await isCreateTable();
        if (!exists) {
            console.log('테이블이 없어 생성 시작');
            await createAllTables();
        } else {
            console.log('이미 모든 테이블 존재함');
        }
    } catch (err) {
        console.error('테이블 초기화 에러:', err);
    }
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