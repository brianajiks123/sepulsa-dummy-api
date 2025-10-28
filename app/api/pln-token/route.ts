import { NextRequest } from 'next/server';
import { corsOptions } from '@/app/lib/utils/cors';
import { sql } from '@/app/lib/db';
import { logTransaction, createPlnToken } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';
import { corsJson } from '@/app/lib/utils/cors';
import type { PlnToken } from '@/app/lib/types/pln';

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nomor_meter, nama_pelanggan, nominal, token_number } = body;
        if (!nomor_meter || !nama_pelanggan || nominal == null) {
            return errorResponse(request, 'Missing required fields: nomor_meter, nama_pelanggan, nominal', 400);
        }
        if (typeof nomor_meter !== 'string' || typeof nama_pelanggan !== 'string') {
            return errorResponse(request, 'Invalid types: nomor_meter, nama_pelanggan must be strings', 400);
        }
        if (typeof nominal !== 'number' || nominal <= 0) {
            return errorResponse(request, 'Invalid nominal: must be a positive number', 400);
        }
        await logTransaction(
            'PLN_TOKEN',
            'pending',
            `Pembelian token listrik untuk ${nomor_meter}`,
            { nomor_meter, nama_pelanggan, nominal, token_number }
        );
        const tokenData = await createPlnToken(nomor_meter, nama_pelanggan, nominal, token_number);
        return jsonResponse(request, {
            message: 'Data token listrik berhasil diproses dan dicatat',
            data: tokenData,
        }, 201);
    } catch (error) {
        console.error('Error processing PLN token:', error);
        return errorResponse(request, 'Failed to process PLN token data', 500);
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nomorMeter = searchParams.get('nomor_meter');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    try {
        let rows: PlnToken[];
        if (nomorMeter) {
            rows = await sql`
                SELECT
                    id,
                    nomor_meter,
                    nama_pelanggan,
                    nominal,
                    token_number,
                    created_at AT TIME ZONE 'Asia/Jakarta' AS created_at
                FROM pln_tokens
                WHERE nomor_meter = ${nomorMeter}
                ORDER BY created_at DESC
                LIMIT ${limit}
            ` as PlnToken[];
        } else {
            rows = await sql`
                SELECT
                    id,
                    nomor_meter,
                    nama_pelanggan,
                    nominal,
                    token_number,
                    created_at AT TIME ZONE 'Asia/Jakarta' AS created_at
                FROM pln_tokens
                ORDER BY created_at DESC
                LIMIT ${limit}
            ` as PlnToken[];
        }
        if (rows.length === 0) {
            return errorResponse(request, 'No token data found matching the criteria', 404);
        }
        return jsonResponse(request, {
            data: rows,
            count: rows.length,
            filters: { nomor_meter: nomorMeter || null }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error querying PLN tokens:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            params: { nomor_meter: nomorMeter, limit }
        });
        return corsJson(request, {
            success: false,
            status: 500,
            error: {
                message: 'Failed to query token data',
                details: errorMessage,
            },
        }, 500);
    }
}
