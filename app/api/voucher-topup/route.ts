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
    const nomorId = searchParams.get('nomor_id');
    const limit = nomorId ? 1 : Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    try {
        let whereClause = sql``;
        if (nomorId) {
            whereClause = sql`AND details->>'nomor_id' = ${nomorId}`;
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
            WHERE transaction_type ILIKE '%VOUCHER TOPUP%'
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ${limit}
        `;
        if (rows.length === 0) {
            return errorResponse(request, 'No topup log found matching the criteria', 404);
        }
        return jsonResponse(request, {
            pelanggan: rows, count: rows.length, filters: { nomor_id: nomorId || null }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error querying topup logs:', { message: errorMessage, params: { nomor_id: nomorId, limit } });
        return errorResponse(request, 'Failed to query topup logs', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nomor_id, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, topup_code, skipLog } = body;
        if (!nomor_id || !nama_pelanggan || nominal == null || nominal <= 0 || !topup_code) {
            return errorResponse(request, 'Missing or invalid required fields: nomor_id, nama_pelanggan, nominal (must be positive), topup_code', 400);
        }
        if (typeof nomor_id !== 'string' || typeof nama_pelanggan !== 'string' || typeof topup_code !== 'string') {
            return errorResponse(request, 'Invalid types: nomor_id, nama_pelanggan, topup_code must be strings', 400);
        }
        const email = email_pelanggan || null;
        const nomorPel = nomor_pelanggan || null;
        if (!skipLog) {
            await logTransaction(
                'VOUCHER TOPUP',
                'success',
                `Topup voucher untuk ${nomor_id}`,
                { nomor_id, nama_pelanggan, email_pelanggan: email, nomor_pelanggan: nomorPel, nominal, topup_code }
            );
        }
        return jsonResponse(request, { message: 'Voucher topup transaction logged successfully' }, 201);
    } catch (error) {
        console.error('Error logging voucher topup:', error);
        return errorResponse(request, 'Failed to log voucher topup transaction', 500);
    }
}
