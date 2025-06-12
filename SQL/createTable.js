// db.js (ES Module 버전)
import sqlite3Default from 'sqlite3';
const sqlite3 = sqlite3Default.verbose();
import os from 'os';
import path from 'path';
import fs from 'fs';

// 앱 저장 폴더 경로 설정
const home = os.homedir();
const appStorage = path.join(home, '.simpleLabelingApp');
if (!fs.existsSync(appStorage)) {
    fs.mkdirSync(appStorage, { recursive: true });
}

// 싱글톤 DB 인스턴스
let dbInstance = null;
export function initDb() {
    if (dbInstance) return dbInstance;
    const dbPath = path.join(appStorage, 'DB.sqlite');
    dbInstance = new sqlite3.Database(dbPath, err => {
        if (err) {
            console.error('DB 생성/열기 에러:', err);
        } else {
            console.log('✅ 데이터베이스 생성됨 or 열림');
            dbInstance.run('PRAGMA foreign_keys = ON;');
        }
    });
    return dbInstance;
}

// SQL 문자열 정의: setting과 systemTable은 단일 객체용으로 PK 체크 설정
export const SQL_CREATE_SETTING = `
    CREATE TABLE IF NOT EXISTS setting (
                                           settingId INTEGER PRIMARY KEY CHECK(settingId = 1),
                                           key TEXT
    );
`;
export const SQL_CREATE_SYSTEM_TABLE = `
    CREATE TABLE IF NOT EXISTS systemTable (
                                               systemId INTEGER PRIMARY KEY CHECK(systemId = 1),
                                               settingId INTEGER UNIQUE CHECK(settingId = 1),
                                               FOREIGN KEY(settingId) REFERENCES setting(settingId) ON DELETE CASCADE
    );
`;
export const SQL_CREATE_WORKSPACE = `
    CREATE TABLE IF NOT EXISTS workspace (
                                             workspaceNo INTEGER PRIMARY KEY AUTOINCREMENT,
                                             systemId INTEGER NOT NULL,
                                             workspaceName TEXT NOT NULL UNIQUE,
                                             FOREIGN KEY(systemId) REFERENCES systemTable(systemId) ON DELETE CASCADE
    );
`;
export const SQL_CREATE_LABEL = `
    CREATE TABLE IF NOT EXISTS label (
                                         labelNo INTEGER PRIMARY KEY AUTOINCREMENT,
                                         labelName TEXT NOT NULL UNIQUE
    );
`;
export const SQL_CREATE_IMAGE = `
    CREATE TABLE IF NOT EXISTS image (
                                         imageNo INTEGER PRIMARY KEY AUTOINCREMENT,
                                         workspaceNo INTEGER NOT NULL,
                                         imagePath TEXT NOT NULL UNIQUE,
                                         labelNo INTEGER UNIQUE,
                                         FOREIGN KEY(workspaceNo) REFERENCES workspace(workspaceNo) ON DELETE CASCADE,
                                         FOREIGN KEY(labelNo) REFERENCES label(labelNo) ON DELETE SET NULL
    );
`;
export const SQL_CREATE_SETS = `
    CREATE TABLE IF NOT EXISTS sets (
                                        setNo INTEGER PRIMARY KEY AUTOINCREMENT,
                                        parentLabel INTEGER UNIQUE,
                                        parentSet INTEGER,
                                        setName TEXT NOT NULL,
                                        FOREIGN KEY(parentLabel) REFERENCES label(labelNo) ON DELETE SET NULL,
                                        FOREIGN KEY(parentSet) REFERENCES sets(setNo) ON DELETE SET NULL,
                                        UNIQUE(parentSet, setName)
    );
`;
// 이미지-세트 다대다 관계용 조인 테이블
export const SQL_CREATE_IMAGE_SET = `
CREATE TABLE IF NOT EXISTS image_sets (
    imageNo INTEGER NOT NULL,
    setNo INTEGER NOT NULL,
    PRIMARY KEY(imageNo, setNo),
    FOREIGN KEY(imageNo) REFERENCES image(imageNo) ON DELETE CASCADE,
    FOREIGN KEY(setNo) REFERENCES sets(setNo) ON DELETE CASCADE
);
`;

// 각 테이블 생성 함수: Promise 반환, 단일 객체용 행 삽입
export function createSettingTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_SETTING, err => {
            if (err) {
                console.error('setting 테이블 생성 에러:', err);
                reject(err);
            } else {
                console.log('✅ setting 테이블 생성됨');
                // 단일 객체 행 삽입: settingId = 1
                db.run(`INSERT OR IGNORE INTO setting(settingId, key) VALUES (1, NULL);`, insertErr => {
                    if (insertErr) console.error('setting 기본 행 삽입 에러:', insertErr);
                    else console.log('✅ setting 기본 행 확인/삽입 완료');
                    resolve();
                });
            }
        });
    });
}
export function createSystemTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_SYSTEM_TABLE, err => {
            if (err) {
                console.error('systemTable 생성 에러:', err);
                reject(err);
            } else {
                console.log('✅ systemTable 생성됨');
                // 단일 객체 행 삽입: systemId = 1, settingId = 1
                db.run(`INSERT OR IGNORE INTO systemTable(systemId, settingId) VALUES (1, 1);`, insertErr => {
                    if (insertErr) console.error('systemTable 기본 행 삽입 에러:', insertErr);
                    else console.log('✅ systemTable 기본 행 확인/삽입 완료');
                    resolve();
                });
            }
        });
    });
}
export function createWorkspaceTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_WORKSPACE, err => {
            if (err) {
                console.error('workspace 생성 에러:', err);
                reject(err);
            } else {
                console.log('✅ workspace 생성됨');
                resolve();
            }
        });
    });
}
export function createLabelTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_LABEL, err => {
            if (err) {
                console.error('label 생성 에러:', err);
                reject(err);
            } else {
                console.log('✅ label 생성됨');
                resolve();
            }
        });
    });
}
export function createImageTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_IMAGE, err => {
            if (err) {
                console.error('image 생성 에러:', err);
                reject(err);
            } else {
                console.log('✅ image 생성됨');
                resolve();
            }
        });
    });
}
export function createSetsTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_SETS, err => {
            if (err) {
                console.error('sets 생성 에러:', err);
                reject(err);
            } else {
                console.log('✅ sets 생성됨');
                resolve();
            }
        });
    });
}
export function createImageSetTable() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        db.run(SQL_CREATE_IMAGE_SET, err => {
            if (err) {
                console.error('image_sets 생성 에러:', err);
                reject(err);
            } else {
                console.log('✅ image_sets 생성됨');
                resolve();
            }
        });
    });
}

// 모든 테이블을 순차적으로 생성 및 단일 객체 삽입
export function createAllTables() {
    return createSettingTable()
        .then(createSystemTable)
        .then(createWorkspaceTable)
        .then(createLabelTable)
        .then(createImageTable)
        .then(createSetsTable)
        .then(createImageSetTable)
        .catch(err => {
            console.error('테이블 생성 중 에러 발생:', err);
            throw err;
        });
}

// 모든 테이블 존재 여부 확인: true면 모두 존재
export function isCreateTable() {
    const db = initDb();
    const tableNames = ['setting', 'systemTable', 'workspace', 'label', 'image', 'sets', 'image_sets'];
    return new Promise((resolve, reject) => {
        const placeholders = tableNames.map(() => '?').join(',');
        const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`;
        db.all(sql, tableNames, (err, rows) => {
            if (err) {
                console.error('테이블 존재 확인 에러:', err);
                reject(err);
            } else {
                resolve(rows.length === tableNames.length);
            }
        });
    });
}

// DB 닫기 함수 (앱 종료 시 호출 권장)
export function closeDb() {
    if (!dbInstance) return Promise.resolve();
    return new Promise((resolve, reject) => {
        dbInstance.close(err => {
            if (err) {
                console.error('DB 닫기 에러:', err);
                reject(err);
            } else {
                console.log('✅ DB 닫힘');
                dbInstance = null;
                resolve();
            }
        });
    });
}
