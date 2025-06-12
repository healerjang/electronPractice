
import { initDb } from './createTable.js';

/**
 * insertWorkspace: 워크스페이스를 삽입
 * @param {string} workspaceName
 * @returns {Promise<{success: boolean, workspaceNo: number|null}>}
 */
export async function insertWorkspace(workspaceName) {
    const db = initDb();
    return new Promise((resolve) => {
        // systemId는 단일 객체이므로 1로 고정
        const systemId = 1;
        const sql = `INSERT INTO workspace(workspaceName, systemId) VALUES (?, ?);`;
        db.run(sql, [workspaceName, systemId], function(err) {
            if (err) {
                console.error('insertWorkspace 에러:', err);
                resolve({ success: false, workspaceNo: null });
            } else {
                console.log('✅ 워크스페이스 삽입됨, workspaceNo=', this.lastID);
                resolve({ success: true, workspaceNo: this.lastID });
            }
        });
    });
}

/**
 * insertImage: 이미지를 삽입
 * @param {string} imagePath
 * @param {number} workspaceNo
 * @returns {Promise<{success: boolean, imageNo: number|null}>}
 */
export async function insertImage(imagePath, workspaceNo) {
    const db = initDb();
    return new Promise((resolve) => {
        const sql = `INSERT INTO image(workspaceNo, imagePath) VALUES (?, ?);`;
        db.run(sql, [workspaceNo, imagePath], function(err) {
            if (err) {
                console.error('insertImage 에러:', err);
                resolve({ success: false, imageNo: null });
            } else {
                console.log('✅ 이미지 삽입됨, imageNo=', this.lastID);
                resolve({ success: true, imageNo: this.lastID });
            }
        });
    });
}

/**
 * insertLabel: 레이블을 삽입
 * @param {string} labelName
 * @param {number|null} parentLabelNo - 부모 레이블 번호
 * @returns {Promise<{success: boolean, labelNo: number|null}>}
 */
export async function insertLabel(labelName, parentLabelNo = null) {
    const db = initDb();
    return new Promise((resolve) => {
        // parentLabelNo가 주어지면 해당 레이블 존재 여부 확인
        if (parentLabelNo !== null) {
            const checkSql = `SELECT labelNo FROM label WHERE labelNo = ?;`;
            db.get(checkSql, [parentLabelNo], (checkErr, row) => {
                if (checkErr) {
                    console.error('insertLabel parent 검사 에러:', checkErr);
                    resolve({ success: false, labelNo: null });
                } else if (!row) {
                    console.warn('insertLabel: parentLabelNo 없음:', parentLabelNo);
                    resolve({ success: false, labelNo: null });
                } else {
                    doInsert();
                }
            });
        } else {
            doInsert();
        }

        function doInsert() {
            const sql = `INSERT INTO label(labelName) VALUES (?);`;
            db.run(sql, [labelName], function(err) {
                if (err) {
                    console.error('insertLabel 에러:', err);
                    resolve({ success: false, labelNo: null });
                } else {
                    console.log('✅ 레이블 삽입됨, labelNo=', this.lastID);
                    resolve({ success: true, labelNo: this.lastID });
                }
            });
        }
    });
}

/**
 * insertSet: 세트를 삽입
 * @param {string} setName
 * @param {number|null} parentLabelNo
 * @param {number|null} parentSetNo
 * @returns {Promise<{success: boolean, setNo: number|null}>}
 */
export async function insertSet(setName, parentLabelNo = null, parentSetNo = null) {
    const db = initDb();
    return new Promise((resolve) => {
        // parentLabelNo가 주어지면 존재 확인
        const tasks = [];
        if (parentLabelNo !== null) {
            tasks.push(cb => db.get(`SELECT labelNo FROM label WHERE labelNo = ?;`, [parentLabelNo], (err, row) => {
                if (err) return cb(err);
                if (!row) return cb(new Error('parentLabelNo not found'));
                cb(null);
            }));
        }
        // parentSetNo가 주어지면 존재 확인
        if (parentSetNo !== null) {
            tasks.push(cb => db.get(`SELECT setNo FROM sets WHERE setNo = ?;`, [parentSetNo], (err, row) => {
                if (err) return cb(err);
                if (!row) return cb(new Error('parentSetNo not found'));
                cb(null);
            }));
        }
        // 순차 검사
        let idx = 0;
        function next(err) {
            if (err) {
                console.error('insertSet 관계 검사 에러:', err);
                resolve({ success: false, setNo: null });
                return;
            }
            if (idx < tasks.length) {
                const task = tasks[idx++];
                task(next);
            } else {
                // 모든 검사 통과 후 삽입
                const sql = `INSERT INTO sets(setName, parentLabel, parentSet) VALUES (?, ?, ?);`;
                db.run(sql, [setName, parentLabelNo, parentSetNo], function(runErr) {
                    if (runErr) {
                        console.error('insertSet 에러:', runErr);
                        resolve({ success: false, setNo: null });
                    } else {
                        console.log('✅ 세트 삽입됨, setNo=', this.lastID);
                        resolve({ success: true, setNo: this.lastID });
                    }
                });
            }
        }
        next(null);
    });
}
