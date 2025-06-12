// util.js
// 모든 테이블을 삭제(드롭)하는 함수 정의
import { initDb } from './createTable.js';

/**
 * dropAllTables: 현재 데이터베이스의 모든 사용자 정의 테이블을 삭제
 * @returns {Promise<void>} - 완료 시 resolve, 에러 시 reject
 */
export function dropAllTables() {
    const db = initDb();
    return new Promise((resolve, reject) => {
        // sqlite_master에서 테이블 목록 조회
        const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('테이블 목록 조회 에러:', err);
                reject(err);
                return;
            }
            if (!rows || rows.length === 0) {
                console.log('삭제할 테이블이 없습니다.');
                resolve();
                return;
            }
            // DROP TABLE 문을 순차적으로 실행
            const tableNames = rows.map(r => r.name);
            db.serialize(() => {
                tableNames.forEach((table) => {
                    const dropSql = `DROP TABLE IF EXISTS ${table};`;
                    db.run(dropSql, (dropErr) => {
                        if (dropErr) console.error(`테이블 드롭 에러 (${table}):`, dropErr);
                        else console.log(`✅ 테이블 드롭 완료: ${table}`);
                    });
                });
                setImmediate(() => resolve());
            });
        });
    });
}
