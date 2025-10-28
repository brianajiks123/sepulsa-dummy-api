import { NextRequest } from 'next/server';
import { corsOptions } from '@/app/lib/utils/cors';
import { sql } from '@/app/lib/db';
import { logTransaction, createPlnCustomer } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';
import { corsJson } from '@/app/lib/utils/cors';

export interface PlnCustomer {
    id: number;
    id_pelanggan: string;
    nama_pelanggan: string;
    nomor_pelanggan: string;
    nominal: number;
    created_at: string;
}

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_pelanggan, nama_pelanggan, nomor_pelanggan, nominal } = body;

        if (!id_pelanggan || !nama_pelanggan || !nomor_pelanggan || nominal == null) {
            return errorResponse(
                request,
                'Missing required fields: id_pelanggan, nama_pelanggan, nomor_pelanggan, nominal',
                400
            );
        }

        if (typeof id_pelanggan !== 'string' || typeof nama_pelanggan !== 'string' || typeof nomor_pelanggan !== 'string') {
            return errorResponse(request, 'Invalid types: id_pelanggan, nama_pelanggan, nomor_pelanggan must be strings', 400);
        }
        if (typeof nominal !== 'number' || nominal <= 0) {
            return errorResponse(request, 'Invalid nominal: must be a positive number', 400);
        }

        await logTransaction(
            'PLN_POSTPAID',
            'pending',
            `Pembayaran PLN pascabayar untuk ${nomor_pelanggan}`,
            { id_pelanggan, nama_pelanggan, nomor_pelanggan, nominal }
        );

        const customer = await createPlnCustomer(id_pelanggan, nama_pelanggan, nomor_pelanggan, nominal);

        return jsonResponse(request, {
            message: 'Data pelanggan PLN pascabayar berhasil diproses dan dicatat',
            data: customer,
        }, 201);

    } catch (error) {
        console.error('Error processing PLN postpaid:', error);
        return errorResponse(request, 'Failed to process PLN postpaid data', 500);
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nomorPelanggan = searchParams.get('nomor_pelanggan');
    const idPelanggan = searchParams.get('id_pelanggan');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    try {
        let query = sql`
            SELECT
                id,
                id_pelanggan,
                nama_pelanggan,
                nomor_pelanggan,
                nominal,
                created_at AT TIME ZONE 'Asia/Jakarta' AS created_at
            FROM pln_customers
            WHERE 1=1
        `;

        if (nomorPelanggan) {
            query = sql`${query} AND nomor_pelanggan = ${nomorPelanggan}`;
        }
        if (idPelanggan) {
            query = sql`${query} AND id_pelanggan = ${idPelanggan}`;
        }

        query = sql`${query} ORDER BY created_at DESC LIMIT ${limit}`;

        const rows = await query as PlnCustomer[];

        if (rows.length === 0) {
            return errorResponse(request, 'No pelanggan found matching the criteria', 404);
        }

        return jsonResponse(request, {
            data: rows,
            count: rows.length,
            filters: { nomor_pelanggan: nomorPelanggan || null, id_pelanggan: idPelanggan || null }
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

        console.error('Error querying PLN customers:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            params: { nomor_pelanggan: nomorPelanggan, id_pelanggan: idPelanggan, limit }
        });

        return corsJson(request, {
            success: false,
            status: 500,
            error: {
                message: 'Failed to query pelanggan data',
                details: errorMessage,
            },
        }, 500);
    }
}
