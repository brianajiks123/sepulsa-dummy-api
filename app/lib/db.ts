import { neon } from '@netlify/neon';
import { PlnCustomer } from './types/pln';
import { VoucherCustomer } from './types/voucher';

export const sql = neon();

export async function logTransaction(
    transactionType: string,
    status: 'success' | 'pending' | 'failed',
    message: string,
    details?: Record<string, unknown>
): Promise<void> {
    const detailsValue = details ? JSON.stringify(details) : null;
    await sql`
        INSERT INTO log (transaction_type, status, message, details)
        VALUES (${transactionType}, ${status}, ${message}, ${detailsValue}::jsonb)
    `;
}

export async function updatePlnCustomer(
    idPelanggan: string,
    namaPelanggan: string,
    emailPelanggan: string | null,
    nomorPelanggan: string,
    nominal: number
): Promise<PlnCustomer> {
    const emailValue = emailPelanggan ?? 'no-email@example.com';
    const [row] = await sql`
        INSERT INTO pln_customers (id_pelanggan, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal)
        VALUES (${idPelanggan}, ${namaPelanggan}, ${emailValue}, ${nomorPelanggan}, ${nominal})
        ON CONFLICT (id_pelanggan) DO UPDATE SET
            nama_pelanggan = EXCLUDED.nama_pelanggan,
            email_pelanggan = EXCLUDED.email_pelanggan,
            nomor_pelanggan = EXCLUDED.nomor_pelanggan,
            nominal = EXCLUDED.nominal,
            updated_at = NOW()
        RETURNING id, id_pelanggan, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, created_at AT TIME ZONE 'Asia/Jakarta' AS created_at, updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
    `;
    return row as PlnCustomer;
}

export async function updatePlnToken(
    nomorMeter: string,
    namaPelanggan: string,
    emailPelanggan: string | null,
    nomorPelanggan: string | null,
    nominal: number,
    tokenNumber: string
) {
    const emailValue = emailPelanggan ?? 'no-email@example.com';
    const nomorPelValue = nomorPelanggan ?? '';
    const result = await sql`
        INSERT INTO pln_tokens (nomor_meter, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, token_number)
        VALUES (${nomorMeter}, ${namaPelanggan}, ${emailValue}, ${nomorPelValue}, ${nominal}, ${tokenNumber})
        ON CONFLICT (nomor_meter) DO UPDATE SET
            nama_pelanggan = EXCLUDED.nama_pelanggan,
            email_pelanggan = EXCLUDED.email_pelanggan,
            nomor_pelanggan = EXCLUDED.nomor_pelanggan,
            nominal = EXCLUDED.nominal,
            token_number = EXCLUDED.token_number,
            updated_at = NOW()
        RETURNING id, nomor_meter, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, token_number, created_at AT TIME ZONE 'Asia/Jakarta' AS created_at, updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
    `;
    return result[0];
}

export async function updateVoucherCustomer(
    idPelanggan: string,
    namaPelanggan: string,
    emailPelanggan: string | null,
    nomorPelanggan: string,
    nominal: number
): Promise<VoucherCustomer> {
    const emailValue = emailPelanggan ?? 'no-email@example.com';
    const [row] = await sql`
        INSERT INTO voucher_customers (id_pelanggan, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal)
        VALUES (${idPelanggan}, ${namaPelanggan}, ${emailValue}, ${nomorPelanggan}, ${nominal})
        ON CONFLICT (id_pelanggan) DO UPDATE SET
            nama_pelanggan = EXCLUDED.nama_pelanggan,
            email_pelanggan = EXCLUDED.email_pelanggan,
            nomor_pelanggan = EXCLUDED.nomor_pelanggan,
            nominal = EXCLUDED.nominal,
            updated_at = NOW()
        RETURNING id, id_pelanggan, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, created_at AT TIME ZONE 'Asia/Jakarta' AS created_at, updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
    `;
    return row as VoucherCustomer;
}

export async function updateVoucherTopup(
    nomorId: string,
    namaPelanggan: string,
    emailPelanggan: string | null,
    nomorPelanggan: string | null,
    nominal: number,
    topupCode: string
) {
    const emailValue = emailPelanggan ?? 'no-email@example.com';
    const nomorPelValue = nomorPelanggan ?? '';
    const result = await sql`
        INSERT INTO voucher_topups (nomor_id, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, topup_code)
        VALUES (${nomorId}, ${namaPelanggan}, ${emailValue}, ${nomorPelValue}, ${nominal}, ${topupCode})
        ON CONFLICT (nomor_id) DO UPDATE SET
            nama_pelanggan = EXCLUDED.nama_pelanggan,
            email_pelanggan = EXCLUDED.email_pelanggan,
            nomor_pelanggan = EXCLUDED.nomor_pelanggan,
            nominal = EXCLUDED.nominal,
            topup_code = EXCLUDED.topup_code,
            updated_at = NOW()
        RETURNING id, nomor_id, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, topup_code, created_at AT TIME ZONE 'Asia/Jakarta' AS created_at, updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
    `;
    return result[0];
}
