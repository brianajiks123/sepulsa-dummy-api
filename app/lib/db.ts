import mysql from 'mysql2/promise';
import type { RowDataPacket, FieldPacket } from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function query<T extends RowDataPacket = RowDataPacket>(sql: string, params?: unknown[]): Promise<T[]> {
    const [rows] = (await pool.execute(sql, params)) as [T[], FieldPacket[]];
    return rows;
}

export async function logTransaction(transactionType: string, status: 'success' | 'failed', message: string, details?: Record<string, unknown>): Promise<void> {
    const sql = `
    INSERT INTO log (transaction_type, status, message, details)
    VALUES (?, ?, ?, ?)
  `;
    await pool.execute(sql, [transactionType, status, message, details ? JSON.stringify(details) : null]);
}
