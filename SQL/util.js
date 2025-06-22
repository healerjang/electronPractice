// util.js
// 모든 테이블을 삭제(드롭)하는 함수 정의
import { initDb } from './createTable.js';
import logger from '../util/logger.js'

/**
 * dropAllTables: 현재 데이터베이스의 모든 사용자 정의 테이블을 삭제
 * @returns {Promise<void>} - 완료 시 resolve, 에러 시 reject
 */
export function dropAllTables() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                logger.error('Util.js: Table list search error:', err);
                reject(err);
                return;
            }
            if (!rows || rows.length === 0) {
                logger.info('Util.js: There are no tables to delete');
                resolve();
                return;
            }
            const tableNames = rows.map(r => r.name);
            db.serialize(() => {
                db.run('PRAGMA foreign_keys = OFF;');
                tableNames.forEach((table) => {
                    const dropSql = `DROP TABLE IF EXISTS ${table};`;
                    db.run(dropSql, (dropErr) => {
                        if (dropErr) logger.error(`Util.js: Table drop error (${table}):`, dropErr);
                        else logger.info(`Util.js: Table drop complete: ${table}`);
                    });
                });
                db.run('PRAGMA foreign_keys = ON;');
                setImmediate(() => resolve());
            });
        });
    });
}
