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
import {
    getImagesInRange,
    getLabelsByWorkspace,
    getMaxImageNo,
    getSetsByWorkspace, getWorkspaces, insertImagesByDir,
    mapLabelToImage,
    mapSetToImage
} from "./SQL/system.js";
import {insertImage, insertLabel, insertSet, insertWorkspace} from "./SQL/insertTable.js";

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
        await dropAllTables();
        const exists = await isCreateTable();
        if (!exists) {
            console.log('main.js: Start creating table');
            await createAllTables();
        } else {
            console.log('main.js: All tables already exist');
        }
    } catch (err) {
        console.error('main.js Table initialization error:', err);
    }
    waitForReactServer(createWindow);
});
ipcMain.handle('getWorkspaces', async () => {
    try {
        console.log("getWorkspaces");
        return await getWorkspaces();
    } catch (e) {
        console.error('IPC getWorkspaces 에러:', e);
        return { result: [] };
    }
});

ipcMain.handle('insertWorkspace', async (event, workspaceName) => {
    try {
        return await insertWorkspace(workspaceName);
    } catch (e) {
        console.error('IPC insertWorkspace 에러:', e);
        return { success: false, workspaceNo: null };
    }
});

ipcMain.handle('insertImage', async (event, imagePath, workspaceNo) => {
    try {
        return await insertImage(imagePath, workspaceNo);
    } catch (e) {
        console.error('IPC insertImage 에러:', e);
        return { success: false, imageNo: null };
    }
});

ipcMain.handle('insertLabel', async (event, labelName, parentLabelNo) => {
    try {
        return await insertLabel(labelName, parentLabelNo);
    } catch (e) {
        console.error('IPC insertLabel 에러:', e);
        return { success: false, labelNo: null };
    }
});

ipcMain.handle('insertSet', async (event, setName, parentLabelNo, parentSetNo) => {
    try {
        return await insertSet(setName, parentLabelNo, parentSetNo);
    } catch (e) {
        console.error('IPC insertSet 에러:', e);
        return { success: false, setNo: null };
    }
});

ipcMain.handle('insertImagesByDir', async (event, folderPath, workspaceNo) => {
    try {
        return await insertImagesByDir(folderPath, workspaceNo);
    } catch (e) {
        console.error('IPC insertImagesByDir 에러:', e);
        return { success: false, inserted: 0, errors: [e.message] };
    }
});

ipcMain.handle('getMaxImageNo', async (event, workspaceNo) => {
    try {
        return await getMaxImageNo(workspaceNo);
    } catch (e) {
        console.error('IPC getMaxImageNo 에러:', e);
        return { maxImageNo: null };
    }
});

ipcMain.handle('getImagesInRange', async (event, workspaceNo, startNum, endNum) => {
    try {
        return await getImagesInRange(workspaceNo, startNum, endNum);
    } catch (e) {
        console.error('IPC getImagesInRange 에러:', e);
        return { result: [] };
    }
});

ipcMain.handle('getLabelsByWorkspace', async (event, workspaceNo) => {
    try {
        return await getLabelsByWorkspace(workspaceNo);
    } catch (e) {
        console.error('IPC getLabelsByWorkspace 에러:', e);
        return { result: [] };
    }
});

ipcMain.handle('getSetsByWorkspace', async (event, workspaceNo) => {
    try {
        return await getSetsByWorkspace(workspaceNo);
    } catch (e) {
        console.error('IPC getSetsByWorkspace 에러:', e);
        return { result: [] };
    }
});

ipcMain.handle('mapLabelToImage', async (event, labelNo, imageNo) => {
    try {
        return await mapLabelToImage(labelNo, imageNo);
    } catch (e) {
        console.error('IPC mapLabelToImage 에러:', e);
        return { success: false };
    }
});

ipcMain.handle('mapSetToImage', async (event, setNo, imageNo) => {
    try {
        return await mapSetToImage(setNo, imageNo);
    } catch (e) {
        console.error('IPC mapSetToImage 에러:', e);
        return { success: false };
    }
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

