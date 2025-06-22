import http from "http";
import {app, BrowserWindow, dialog, ipcMain} from 'electron';
import 'dotenv/config';
import fs from "fs/promises";
import { isCreateTable, createAllTables } from './SQL/createTable.js';
import {dropAllTables} from "./SQL/util.js";
import path from 'path';
import { fileURLToPath } from 'url';
import {insertWorkspace} from "./SQL/insertTable.js";
import {getWorkspaces} from "./SQL/system.js";
import logger from './util/logger.js'

const REACT_URL = process.env.REACT_URL;
const CHECK_INTERVAL = 2000;

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
        logger.info(`Main.js: React server ready (status ${res.statusCode})`);
        cb();
    });
    req.on('error', () => {
        logger.info(`Main.js:  Server connection failed, waiting for reconnection...`);
        setTimeout(() => waitForReactServer(cb), CHECK_INTERVAL);
    });
    req.end();
}

app.whenReady().then(async () => {
    logger.info('Main.js: App ready, waiting for React server...');
    try {
        await dropAllTables();
        const exists = await isCreateTable();
        if (!exists) {
            logger.info('Main.js: Start creating table');
            await createAllTables();
        } else {
            logger.info('Main.js: All tables already exist');
        }
    } catch (err) {
        logger.error('Main.js: Table initialization error:', err);
    }
    waitForReactServer(createWindow);
});

ipcMain.handle('getWorkspaces', async () => {
    try {
        logger.debug("Main.js: IPC getWorkspaces started");
        return await getWorkspaces();
    } catch (e) {
        logger.error('Main.js: IPC getWorkspaces error:', e);
        return { result: [] };
    }
});

ipcMain.handle('insertWorkspace', async (event, workspaceName) => {
    try {
        logger.debug("Main.js: IPC insertWorkspace started");
        return await insertWorkspace(workspaceName);
    } catch (e) {
        logger.error('Main.js: IPC insertWorkspace error:', e);
        return { success: false, workspaceNo: null };
    }
});
//
// ipcMain.handle('insertImage', async (event, imagePath, workspaceNo) => {
//     try {
//         logger.debug("Main.js: IPC insertImage started");
//         return await insertImage(imagePath, workspaceNo);
//     } catch (e) {
//         logger.error('Main.js: IPC insertImage error:', e);
//         return { success: false, imageNo: null };
//     }
// });
//
// ipcMain.handle('insertLabel', async (event, labelName, parentLabelNo) => {
//     try {
//         logger.debug("Main.js: IPC insertLabel started");
//         return await insertLabel(labelName, parentLabelNo);
//     } catch (e) {
//         logger.error('Main.js: IPC insertLabel error:', e);
//         return { success: false, labelNo: null };
//     }
// });
//
// ipcMain.handle('insertSet', async (event, setName, parentLabelNo, parentSetNo) => {
//     try {
//         logger.debug("Main.js: IPC insertSet started");
//         return await insertSet(setName, parentLabelNo, parentSetNo);
//     } catch (e) {
//         logger.error('Main.js: IPC insertSet error:', e);
//         return { success: false, setNo: null };
//     }
// });
//
// ipcMain.handle('insertImagesByDir', async (event, folderPath, workspaceNo) => {
//     try {
//         logger.debug("Main.js: IPC insertImagesByDir started");
//         return await insertImagesByDir(folderPath, workspaceNo);
//     } catch (e) {
//         logger.error('Main.js: IPC insertImagesByDir error:', e);
//         return { success: false, inserted: 0, errors: [e.message] };
//     }
// });
//
// ipcMain.handle('getMaxImageNo', async (event, workspaceNo) => {
//     try {
//         logger.debug("Main.js: IPC getMaxImageNo started");
//         return await getMaxImageNo(workspaceNo);
//     } catch (e) {
//         logger.error('Main.js: IPC getMaxImageNo error:', e);
//         return { maxImageNo: null };
//     }
// });
//
// ipcMain.handle('getImagesInRange', async (event, workspaceNo, startNum, endNum) => {
//     try {
//         logger.debug("Main.js: IPC getImagesInRange started");
//         return await getImagesInRange(workspaceNo, startNum, endNum);
//     } catch (e) {
//         logger.error('Main.js: IPC getImagesInRange error:', e);
//         return { result: [] };
//     }
// });
//
// ipcMain.handle('getLabelsByWorkspace', async (event, workspaceNo) => {
//     try {
//         logger.debug("Main.js: IPC getLabelsByWorkspace started");
//         return await getLabelsByWorkspace(workspaceNo);
//     } catch (e) {
//         logger.error('Main.js: IPC getLabelsByWorkspace error:', e);
//         return { result: [] };
//     }
// });
//
// ipcMain.handle('getSetsByWorkspace', async (event, workspaceNo) => {
//     try {
//         logger.debug("Main.js: IPC getSetsByWorkspace started");
//         return await getSetsByWorkspace(workspaceNo);
//     } catch (e) {
//         logger.error('Main.js: IPC getSetsByWorkspace error:', e);
//         return { result: [] };
//     }
// });
//
// ipcMain.handle('mapLabelToImage', async (event, labelNo, imageNo) => {
//     try {
//         logger.debug("Main.js: IPC mapLabelToImage started");
//         return await mapLabelToImage(labelNo, imageNo);
//     } catch (e) {
//         logger.error('Main.js: IPC mapLabelToImage error:', e);
//         return { success: false };
//     }
// });
//
// ipcMain.handle('mapSetToImage', async (event, setNo, imageNo) => {
//     try {
//         logger.debug("Main.js: IPC mapSetToImage started");
//         return await mapSetToImage(setNo, imageNo);
//     } catch (e) {
//         logger.error('Main.js: IPC mapSetToImage error:', e);
//         return { success: false };
//     }
// });

ipcMain.on("logging", (event, logType, message)=> {
    switch (logType) {
        case 'debug':
            logger.debug(message);
            break;
        case 'info':
            logger.info(message);
            break;
        case 'warn':
            logger.warn(message);
            break;
        case 'error':
            logger.error(message);
            break;
        default:
            logger.error("Main.js: is invalid logType");
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

