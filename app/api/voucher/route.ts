import { NextRequest } from 'next/server';
import { corsOptions } from '@/app/lib/utils/cors';
import { sql } from '@/app/lib/db';
import { logTransaction } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nomorPelanggan = searchParams.get('nomor_pelanggan');
    const idPelanggan = searchParams.get('id_pelanggan');
    const limit = idPelanggan ? 1 : Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    try {
        let whereClause = sql``;
        if (nomorPelanggan || idPelanggan) {
            if (nomorPelanggan && idPelanggan) {
                whereClause = sql`AND (details->>'nomor_pelanggan' = ${nomorPelanggan} AND details->>'id_pelanggan' = ${idPelanggan})`;
            } else if (nomorPelanggan) {
                whereClause = sql`AND details->>'nomor_pelanggan' = ${nomorPelanggan}`;
            } else if (idPelanggan) {
                whereClause = sql`AND details->>'id_pelanggan' = ${idPelanggan}`;
            }
        }
        const rows = await sql`
            SELECT
                id,
                timestamp AT TIME ZONE 'Asia/Jakarta' AS timestamp,
                transaction_type,
                status,
                message,
                details,
                created_at AT TIME ZONE 'Asia/Jakarta' AS created_at
            FROM log
            WHERE transaction_type ILIKE '%VOUCHER%'
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ${limit}
        `;
        if (rows.length === 0) {
            return errorResponse(request, 'No voucher log found matching the criteria', 404);
        }
        return jsonResponse(request, {
            pelanggan: rows, count: rows.length, filters: { nomor_pelanggan: nomorPelanggan || null, id_pelanggan: idPelanggan || null }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error querying voucher logs:', { message: errorMessage, params: { nomor_pelanggan: nomorPelanggan, id_pelanggan: idPelanggan, limit } });
        return errorResponse(request, 'Failed to query voucher logs', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_pelanggan, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, skipLog } = body;
        if (!id_pelanggan || !nama_pelanggan || !nomor_pelanggan || nominal == null || nominal <= 0) {
            return errorResponse(request, 'Missing or invalid required fields: id_pelanggan, nama_pelanggan, nomor_pelanggan, nominal (must be positive)', 400);
        }
        if (typeof id_pelanggan !== 'string' || typeof nama_pelanggan !== 'string' || typeof nomor_pelanggan !== 'string') {
            return errorResponse(request, 'Invalid types: fields must be strings', 400);
        }
        const email = email_pelanggan || null;
        if (!skipLog) {
            await logTransaction(
                'VOUCHER',
                'success',
                `Pembelian voucher untuk ${id_pelanggan}`,
                { id_pelanggan, nama_pelanggan, email_pelanggan: email, nomor_pelanggan, nominal }
            );
        }
        return jsonResponse(request, { message: 'Voucher transaction logged successfully' }, 201);
    } catch (error) {
        console.error('Error logging voucher:', error);
        return errorResponse(request, 'Failed to log voucher transaction', 500);
    }
}
