
import sqlite3Default from 'sqlite3';
const sqlite3 = sqlite3Default.verbose();
import {app} from 'electron';
import os from 'os';
import path from 'path';
import fs from 'fs';

const home = app.getAppPath();
const appStorage = path.join(home, 'storage');
if (!fs.existsSync(appStorage)) {
    fs.mkdirSync(appStorage, { recursive: true });
}

let dbInstance = null;
export function initDb() {
    if (dbInstance) return dbInstance;
    const dbPath = path.join(appStorage, 'DB.sqlite');
    dbInstance = new sqlite3.Database(dbPath, err => {
        if (err) {
            console.error('DB Open Error:', err);
        } else {
            console.log('DB Open Success:');
            dbInstance.run('PRAGMA foreign_keys = ON;');
        }
    });
    return dbInstance;
}

// SQL 문자열 정의: setting과 systemTable은 단일 객체용으로 PK 체크 설정
const SQL_CREATE_SETTING = `
    CREATE TABLE IF NOT EXISTS setting (
        settingId INTEGER PRIMARY KEY CHECK(settingId = 1)
    );
`;
const SQL_CREATE_SYSTEM_TABLE = `
    CREATE TABLE IF NOT EXISTS systemTable (
        systemId INTEGER PRIMARY KEY CHECK(systemId = 1)
    );
`;

const SQL_CREATE_IMAGE = `
    CREATE TABLE IF NOT EXISTS image (
        imageNo INTEGER PRIMARY KEY AUTOINCREMENT,
        imagePath TEXT NOT NULL UNIQUE,
        labelNo INTEGER UNIQUE,
        FOREIGN KEY(labelNo) REFERENCES label(labelNo) ON DELETE SET NULL
    );
`;

const SQL_CREATE_WORKSPACE = `
    CREATE TABLE IF NOT EXISTS workspace (
        workspaceNo INTEGER PRIMARY KEY AUTOINCREMENT,
        workspaceName TEXT NOT NULL UNIQUE
    );
`;

const SQL_CREATE_STREAM = `
    CREATE TABLE IF NOT EXISTS stream (
        streamNo INTEGER PRIMARY KEY AUTOINCREMENT,
        streamName TEXT NOT NULL UNIQUE,
        workspaceNo INTEGER,
        FOREIGN KEY(workspaceNo) REFERENCES workspace(workspaceNo) ON DELETE CASCADE
    );
`;

const SQL_CREATE_LABEL = `
    CREATE TABLE IF NOT EXISTS label (
        labelNo INTEGER PRIMARY KEY AUTOINCREMENT,
        labelName TEXT NOT NULL UNIQUE,
        imageNo INTEGER,
        FOREIGN KEY(imageNo) REFERENCES image(imageNo) ON DELETE SET NULL
    );
`;

const SQL_CREATE_SETS = `
    CREATE TABLE IF NOT EXISTS sets (
       setNo INTEGER PRIMARY KEY AUTOINCREMENT,
       setName TEXT NOT NULL UNIQUE
    );
`;

const SQL_CREATE_STREAM_IMAGE = `
    CREATE TABLE IF NOT EXISTS stream_images (
        streamNo INTEGER NOT NULL,
        imageNo INTEGER NOT NULL,
        PRIMARY KEY(streamNo, imageNo),
        FOREIGN KEY(imageNo) REFERENCES image(imageNo) ON DELETE CASCADE,
        FOREIGN KEY(streamNo) REFERENCES sets(streamNo) ON DELETE CASCADE
    )
`

const SQL_CREATE_IMAGE_SET = `
    CREATE TABLE IF NOT EXISTS image_sets (
        imageNo INTEGER NOT NULL,
        setNo INTEGER NOT NULL,
        PRIMARY KEY(imageNo, setNo),
        FOREIGN KEY(imageNo) REFERENCES image(imageNo) ON DELETE CASCADE,
        FOREIGN KEY(setNo) REFERENCES sets(setNo) ON DELETE CASCADE
    );
`;

function createSettingTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_SETTING, err => {
            if (err) {
                console.error('setting table setting Error:', err);
                reject(err);
            } else {
                console.log('✅ setting table is created');
                db.run(`INSERT OR IGNORE INTO setting(settingId, key) VALUES (1, NULL);`, insertErr => {
                    if (insertErr) console.error('insert setting common row Error:', insertErr);
                    else console.log('insert setting common row success');
                    resolve();
                });
            }
        });
    });
}

function createSystemTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_SYSTEM_TABLE, err => {
            if (err) {
                console.error('systemTable create Error:', err);
                reject(err);
            } else {
                console.log('systemTable created');
                db.run(`INSERT OR IGNORE INTO systemTable(systemId, settingId) VALUES (1, 1);`, insertErr => {
                    if (insertErr) console.error('insert systemTable common row Error:', insertErr);
                    else console.log('insert systemTable common row success');
                    resolve();
                });
            }
        });
    });
}
function createWorkspaceTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_WORKSPACE, err => {
            if (err) {
                console.error('workspace create Error:', err);
                reject(err);
            } else {
                console.log('workspace created');
                resolve();
            }
        });
    });
}
function createStreamTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_STREAM, err => {
            if (err) {
                console.error('label create Error:', err);
                reject(err);
            } else {
                console.log('label created');
                resolve();
            }
        });
    });
}
function createLabelTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_LABEL, err => {
            if (err) {
                console.error('label create Error:', err);
                reject(err);
            } else {
                console.log('label created');
                resolve();
            }
        });
    });
}
function createImageTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_IMAGE, err => {
            if (err) {
                console.error('image create Error:', err);
                reject(err);
            } else {
                console.log('image created');
                resolve();
            }
        });
    });
}
function createSetsTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_SETS, err => {
            if (err) {
                console.error('sets create Error:', err);
                reject(err);
            } else {
                console.log('sets created');
                resolve();
            }
        });
    });
}
function createImageSetTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_IMAGE_SET, err => {
            if (err) {
                console.error('image_sets create Error:', err);
                reject(err);
            } else {
                console.log('image_sets created');
                resolve();
            }
        });
    });
}
function createStreamImageTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_STREAM_IMAGE, err => {
            if (err) {
                console.error('image_sets create Error:', err);
                reject(err);
            } else {
                console.log('image_sets created');
                resolve();
            }
        });
    });
}

export function createAllTables() {
    return createSettingTable()
        .then(createSystemTable)
        .then(createWorkspaceTable)
        .then(createStreamTable)
        .then(createImageTable)
        .then(createLabelTable)
        .then(createSetsTable)
        .then(createImageSetTable)
        .then(createStreamImageTable)
        .catch(err => {
            console.error('Error occurred while creating table:', err);
            throw err;
        });
}

export function isCreateTable() {
    const db = initDb();
    const tableNames = ['setting', 'systemTable', 'workspace', 'label', 'image', 'sets', 'image_sets'];
    return new Promise((resolve, reject) => {
        const placeholders = tableNames.map(() => '?').join(',');
        const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`;
        db.all(sql, tableNames, (err, rows) => {
            if (err) {
                console.error('Table existence check error:', err);
                reject(err);
            } else {
                resolve(rows.length === tableNames.length);
            }
        });
    });
}

export function closeDb() {
    if (!dbInstance) return Promise.resolve();
    return new Promise((resolve, reject) => {
        dbInstance.close(err => {
            if (err) {
                console.error('DB close Error:', err);
                reject(err);
            } else {
                console.log('DB is closed');
                dbInstance = null;
                resolve();
            }
        });
    });
}
