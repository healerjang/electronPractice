const { contextBridge, ipcRenderer } = require('electron');
const sqlite3 = require('sqlite3').verbose();
import os from 'os';
import path from 'path';
const fs = require('fs');

const home = os.homedir();
const appStorage = path.join(home, '.simpleLabelingApp');
if (!fs.existsSync(appStorage)) {
    fs.mkdirSync(appStorage, { recursive: true });
}

const db = new sqlite3.Database(path.join(appStorage, 'DB.sqlite'), err => {
    if (err) {
        console.error('DB 생성 에러:', err);
        return;
    }
    console.log('✅ 데이터베이스 생성됨 or 열림');
});

try {
    contextBridge.exposeInMainWorld('electronAPI', {
        openFile: () => ipcRenderer.invoke('show-open-dialog'),
    });
    contextBridge.exposeInMainWorld('sqlAPI', {
        createNewTable: () => {
            db.run(
                `CREATE TABLE IF NOT EXISTS users (
                       id   INTEGER PRIMARY KEY AUTOINCREMENT,
                       name TEXT NOT NULL,
                       age  INTEGER
                     )`,
                err => {
                    if (err) console.error('테이블 생성 에러:', err);
                    else console.log('✅ users 테이블 생성됨');
                    db.close();
                });
        },
    });
} catch (e) {
    console.error('❌ preload error:', e);
}