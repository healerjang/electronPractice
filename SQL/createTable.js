
import sqlite3Default from 'sqlite3';
import {app} from 'electron';
import logger from '../util/logger.js'
import path from 'path';
import fs from 'fs';

const sqlite3 = sqlite3Default;

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
            logger.error('Create Table.js: DB Open Error:', err);
        } else {
            logger.info('Create Table.js: DB Open Success:');
            dbInstance.run('PRAGMA foreign_keys = ON;');
        }
    });
    return dbInstance;
}

const SQL_CREATE_SETTING = `
    CREATE TABLE IF NOT EXISTS setting (
        settingId INTEGER PRIMARY KEY CHECK(settingId = 1)
    );
`;
const SQL_CREATE_SYSTEM_TABLE = `
    CREATE TABLE IF NOT EXISTS system (
        systemId INTEGER PRIMARY KEY CHECK(systemId = 1)
    );
`;
const SQL_CREATE_ATIS = `
    CREATE TABLE IF NOT EXISTS atis (
        cellID TEXT PRIMARY KEY,
        productLine INTEGER NOT NULL,
        lotNo TEXT NOT NULL,
        date datetime NOT NULL
    );
`;
const SQL_CREATE_IMAGE_TYPE = `
    CREATE TABLE IF NOT EXISTS image_type (
        imageTypeNo INTEGER PRIMARY KEY,
        imageTypeName TEXT NOT NULL
    );
`
const SQL_CREATE_IMAGE = `
    CREATE TABLE IF NOT EXISTS image (
        imageNo INTEGER PRIMARY KEY AUTOINCREMENT,
        labelNo INTEGER UNIQUE,
        imageTypeNo INTEGER NOT NULL,
        lastJudge INTEGER,
        aiJudge INTEGER,
        imagePath TEXT,
        cellID TEXT,
        FOREIGN KEY(labelNo) REFERENCES label(labelNo) ON DELETE SET NULL,
        FOREIGN KEY(cellID) REFERENCES atis(cellID) ON Delete CASCADE,
        FOREIGN KEY(imageTypeNo) REFERENCES image_type(imageTypeNo) ON DELETE CASCADE
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
        streamName TEXT NOT NULL,
        workspaceNo INTEGER NOT NULL,
        UNIQUE(streamName, workspaceNo),
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
        FOREIGN KEY(streamNo) REFERENCES stream(streamNo) ON DELETE CASCADE
    );
`;
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
                logger.error('setting table setting Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: setting table is created');
                db.run(`INSERT INTO setting(settingId) VALUES (1);`, insertErr => {
                    if (insertErr) logger.error('Create Table.js: insert setting common row Error:', insertErr);
                    else logger.debug('Create Table.js: insert setting common row success');
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
                logger.error('systemTable create Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: systemTable created');
                db.run(`INSERT INTO system(systemId) VALUES (1);`, insertErr => {
                    if (insertErr) logger.error('Create Table.js: insert systemTable common row Error:', insertErr);
                    else logger.debug('Create Table.js: insert systemTable common row success');
                    resolve();
                });
            }
        });
    });
}
function createAtisTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_ATIS, err => {
            if (err) {
                logger.error('Create Table.js: atis create Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: atis created');
                resolve();
            }
        });
    })
}
function runAsync(db, sql, params=[]) {
    return new Promise((res, rej) => {
        db.run(sql, params, err => {
            if (err) return rej(err);
            res();
        });
    });
}
export async function createImageTypeTable() {
    const db = initDb();
    await runAsync(db, SQL_CREATE_IMAGE_TYPE);
    const insertData = ["BlueTool", "CA(TOP)", "AN(TOP)", "CA(BOT)", "AN(BOT)"];
    for (const name of insertData) {
        await runAsync(db, 'INSERT OR IGNORE INTO image_type(imageTypeName) VALUES (?);', [name]);
    }
    logger.debug('Create Table.js: insert data into imageType success');
}
function createWorkspaceTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_WORKSPACE, err => {
            if (err) {
                logger.error('Create Table.js: workspace create Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: workspace created');
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
                logger.error('Create Table.js: label create Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: label created');
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
                logger.error('Create Table.js: label create Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: label created');
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
                logger.error('Create Table.js: image create Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: image created');
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
                logger.error('Create Table.js: sets create Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: sets created');
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
                logger.error('Create Table.js: image_sets create Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: image_sets created');
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
                logger.error('Create Table.js: image_sets create Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: image_sets created');
                resolve();
            }
        });
    });
}

export function createAllTables() {
    return createSettingTable()
        .then(createSystemTable)
        .then(createAtisTable)
        .then(createImageTypeTable)
        .then(createWorkspaceTable)
        .then(createStreamTable)
        .then(createImageTable)
        .then(createLabelTable)
        .then(createSetsTable)
        .then(createImageSetTable)
        .then(createStreamImageTable)
        .catch(err => {
            logger.error('Create Table.js: Error occurred while creating table:', err);
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
                logger.error('Create Table.js: Table existence check error:', err);
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
                logger.error('Create Table.js: DB close Error:', err);
                reject(err);
            } else {
                logger.info('Create Table.js: DB is closed');
                dbInstance = null;
                resolve();
            }
        });
    });
}
