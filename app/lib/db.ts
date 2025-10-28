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

export interface PlnCustomer {
    id: number;
    id_pelanggan: string;
    nama_pelanggan: string;
    nomor_pelanggan: string;
    nominal: number;
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

export async function createPlnCustomer(
    idPelanggan: string,
    namaPelanggan: string,
    nomorPelanggan: string,
    nominal: number
): Promise<PlnCustomer> {
    await sql`SET LOCAL TIME ZONE 'Asia/Jakarta';`;
    const [row] = await sql`
        INSERT INTO pln_customers (id_pelanggan, nama_pelanggan, nomor_pelanggan, nominal)
        VALUES (${idPelanggan}, ${namaPelanggan}, ${nomorPelanggan}, ${nominal})
        RETURNING id, id_pelanggan, nama_pelanggan, nomor_pelanggan, nominal, created_at
    `;
    return row as PlnCustomer;
}
