import { neon } from '@netlify/neon';

export const sql = neon();

export interface LogRow {
    id: number;
    timestamp: string;
    transaction_type: string;
    status: 'success' | 'pending' | 'failed';
    message: string;
    details: string | null;
    created_at: string;
}

export async function logTransaction(
    transactionType: string,
    status: 'success' | 'pending' | 'failed',
    message: string,
    details?: Record<string, unknown>
): Promise<void> {
    const detailsValue = details ? JSON.stringify(details) : null;

    await sql`SET LOCAL TIME ZONE 'Asia/Jakarta';`;

    await sql`
        INSERT INTO log (transaction_type, status, message, details)
        VALUES (${transactionType}, ${status}, ${message}, ${detailsValue}::jsonb)
    `;
}
