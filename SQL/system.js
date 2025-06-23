// system.js
// 시스템 관련 데이터 조회/삽입 함수 정의
import { initDb } from './createTable.js';
import fs from 'fs';
import path from 'path';
import logger from '../util/logger.js'

/**
 * getWorkspaces: 모든 워크스페이스를 조회
 * @returns {Promise<{result: Array<{workspaceNo: number, workspaceName: string}>}>}
 */
export async function getWorkspaces() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        const sql = `SELECT workspaceNo, workspaceName FROM workspace;`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                logger.error('System.js: getWorkspaces Error:', err);
                reject(err);
            } else {
                resolve({ result: rows.map(r => ({ workspaceNo: r.workspaceNo, workspaceName: r.workspaceName })) });
            }
        });
    });
}
/**
 * getStreams: 워크스페이스에 해당하는 모든 스트림을 조회
 * @param {int} workspaceNo
 * @returns {Promise<{result: Array<{streamNo: number, streamName: string}>}>}
 */
export async function getStreams(workspaceNo) {
    const db = initDb();
    return new Promise((resolve, reject) => {
        const sql = `SELECT streamNo, streamName FROM stream WHERE workspaceNo = ${workspaceNo};`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                logger.error('System.js: getWorkspaces Error:', err);
                reject(err);
            } else {
                resolve({ result: rows.map(r => ({ streamNo: r.streamNo, streamName: r.streamName })) });
            }
        });
    });
}

/**
 * insertImagesByDir: 주어진 폴더 경로를 재귀 탐색하며 이미지 파일을 workspace에 삽입
 * @param {string} folderPath
 * @param {number} workspaceNo
 * @returns {Promise<{success: boolean, inserted: number, errors: Array<string>}>}
 */
export async function insertImagesByDir(folderPath, workspaceNo) {
    const db = initDb();
    const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']);
    let insertedCount = 0;
    const errors = [];

    async function traverse(dir) {
        let entries;
        try {
            entries = await fs.promises.readdir(dir, { withFileTypes: true });
        } catch (err) {
            errors.push(`디렉토리 읽기 실패: ${dir} - ${err.message}`);
            return;
        }
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await traverse(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (imageExtensions.has(ext)) {
                    // 상대 경로 혹은 절대 경로 저장? here use fullPath
                    await new Promise((resolve) => {
                        const sql = `INSERT OR IGNORE INTO image(workspaceNo, imagePath) VALUES (?, ?);`;
                        db.run(sql, [workspaceNo, fullPath], function(err) {
                            if (err) {
                                const msg = `insertImagesByDir 삽입 에러: ${fullPath} - ${err.message}`;
                                console.error(msg);
                                errors.push(msg);
                            } else if (this.lastID) {
                                insertedCount++;
                            }
                            resolve();
                        });
                    });
                }
            }
        }
    }

    try {
        await traverse(folderPath);
        return { success: true, inserted: insertedCount, errors };
    } catch (err) {
        console.error('insertImagesByDir 전체 에러:', err);
        return { success: false, inserted: insertedCount, errors: [...errors, err.message] };
    }
}

/**
 * getMaxImageNo: workspace의 전체 이미지 중 최대 imageNo 반환
 * @param {number} workspaceNo
 * @returns {Promise<{maxImageNo: number|null}>}
 */
export async function getMaxImageNo(workspaceNo) {
    const db = initDb();
    return new Promise((resolve, reject) => {
        const sql = `SELECT MAX(imageNo) as maxNo FROM image WHERE workspaceNo = ?;`;
        db.get(sql, [workspaceNo], (err, row) => {
            if (err) {
                console.error('getMaxImageNo 에러:', err);
                reject(err);
            } else {
                resolve({ maxImageNo: row.maxNo ?? null });
            }
        });
    });
}

/**
 * getImagesInRange: workspaceNo와 startNum, endNum을 주면 해당 범위의 이미지 데이터 반환
 * @param {number} workspaceNo
 * @param {number} startNum
 * @param {number} endNum
 * @returns {Promise<{result: Array<{imageNo: number, imagePath: string, imageLabelNo: number|null, imageSetNos: number[]}>}>}
 */
export async function getImagesInRange(workspaceNo, startNum, endNum) {
    const db = initDb();
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT i.imageNo, i.imagePath, i.labelNo as imageLabelNo,
                   GROUP_CONCAT(iset.setNo) as setNos
            FROM image i
            LEFT JOIN image_sets iset ON i.imageNo = iset.imageNo
            WHERE i.workspaceNo = ? AND i.imageNo BETWEEN ? AND ?
            GROUP BY i.imageNo;
        `;
        db.all(sql, [workspaceNo, startNum, endNum], (err, rows) => {
            if (err) {
                console.error('getImagesInRange 에러:', err);
                reject(err);
            } else {
                const result = rows.map(r => ({
                    imageNo: r.imageNo,
                    imagePath: r.imagePath,
                    imageLabelNo: r.imageLabelNo,
                    imageSetNos: r.setNos ? r.setNos.split(',').map(n => parseInt(n, 10)) : []
                }));
                resolve({ result });
            }
        });
    });
}

/**
 * getLabelsByWorkspace: workspace에서 사용된 모든 라벨 조회
 * @param {number} workspaceNo
 * @returns {Promise<{result: Array<{labelNo: number, labelName: string}>}>}
 */
export async function getLabelsByWorkspace(workspaceNo) {
    const db = initDb();
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT DISTINCT l.labelNo, l.labelName
            FROM label l
            JOIN image i ON l.labelNo = i.labelNo
            WHERE i.workspaceNo = ? AND l.labelNo IS NOT NULL;
        `;
        db.all(sql, [workspaceNo], (err, rows) => {
            if (err) {
                console.error('getLabelsByWorkspace 에러:', err);
                reject(err);
            } else {
                resolve({ result: rows.map(r => ({ labelNo: r.labelNo, labelName: r.labelName })) });
            }
        });
    });
}

/**
 * getSetsByWorkspace: workspace에서 사용된 모든 세트 조회
 * @param {number} workspaceNo
 * @returns {Promise<{result: Array<{setNo: number, setName: string}>}>}
 */
export async function getSetsByWorkspace(workspaceNo) {
    const db = initDb();
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT DISTINCT s.setNo, s.setName
            FROM sets s
            JOIN image_sets iset ON s.setNo = iset.setNo
            JOIN image i ON i.imageNo = iset.imageNo
            WHERE i.workspaceNo = ?;
        `;
        db.all(sql, [workspaceNo], (err, rows) => {
            if (err) {
                console.error('getSetsByWorkspace 에러:', err);
                reject(err);
            } else {
                resolve({ result: rows.map(r => ({ setNo: r.setNo, setName: r.setName })) });
            }
        });
    });
}

/**
 * mapLabelToImage: labelNo와 imageNo를 매핑 (이미지에 라벨 설정)
 * @param {number} labelNo
 * @param {number} imageNo
 * @returns {Promise<{success: boolean}>}
 */
export async function mapLabelToImage(labelNo, imageNo) {
    const db = initDb();
    return new Promise((resolve) => {
        // 존재 여부 확인 (옵션)
        const checkSql = `SELECT imageNo FROM image WHERE imageNo = ?;`;
        db.get(checkSql, [imageNo], (err, row) => {
            if (err || !row) {
                console.error('mapLabelToImage: 이미지 존재하지 않음 또는 에러:', err);
                resolve({ success: false });
            } else {
                const updateSql = `UPDATE image SET labelNo = ? WHERE imageNo = ?;`;
                db.run(updateSql, [labelNo, imageNo], function(uErr) {
                    if (uErr) {
                        console.error('mapLabelToImage 업데이트 에러:', uErr);
                        resolve({ success: false });
                    } else {
                        resolve({ success: true });
                    }
                });
            }
        });
    });
}

/**
 * mapSetToImage: setNo와 imageNo를 매핑 (이미지-세트 관계 삽입)
 * @param {number} setNo
 * @param {number} imageNo
 * @returns {Promise<{success: boolean}>}
 */
export async function mapSetToImage(setNo, imageNo) {
    const db = initDb();
    return new Promise((resolve) => {
        // 존재 여부 확인 (옵션)
        const checkImgSql = `SELECT imageNo FROM image WHERE imageNo = ?;`;
        db.get(checkImgSql, [imageNo], (errImg, rowImg) => {
            if (errImg || !rowImg) {
                console.error('mapSetToImage: 이미지 존재하지 않음 또는 에러:', errImg);
                resolve({ success: false });
            } else {
                const checkSetSql = `SELECT setNo FROM sets WHERE setNo = ?;`;
                db.get(checkSetSql, [setNo], (errSet, rowSet) => {
                    if (errSet || !rowSet) {
                        console.error('mapSetToImage: 세트 존재하지 않음 또는 에러:', errSet);
                        resolve({ success: false });
                    } else {
                        const insertSql = `INSERT OR IGNORE INTO image_sets(imageNo, setNo) VALUES (?, ?);`;
                        db.run(insertSql, [imageNo, setNo], function(iErr) {
                            if (iErr) {
                                console.error('mapSetToImage 삽입 에러:', iErr);
                                resolve({ success: false });
                            } else {
                                resolve({ success: true });
                            }
                        });
                    }
                });
            }
        });
    });
}
