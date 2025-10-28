import { neon } from '@netlify/neon';

const sql = neon();

export interface LogRow {
    id: number;
    timestamp: string;
    transaction_type: string;
    status: 'success' | 'pending' | 'failed';
    message: string;
    details: string | null;
    created_at: string;
}

export async function query<T = LogRow>(
    strings: TemplateStringsArray,
    ...values: unknown[]
): Promise<T[]> {
    const result = await sql(strings, ...values);
    return result as T[];
}

export async function logTransaction(
    transactionType: string,
    status: 'success' | 'pending' | 'failed',
    message: string,
    details?: Record<string, unknown>
): Promise<void> {
    const detailsValue = details ? JSON.stringify(details) : null;

    // Set session timezone to Jakarta before insert
    await sql`SET TIME ZONE 'Asia/Jakarta';`;

    // Insert data
    await sql`
    INSERT INTO log (transaction_type, status, message, details)
    VALUES (${transactionType}, ${status}, ${message}, ${detailsValue}::jsonb)
  `;
}
