import { NextRequest } from 'next/server';
import { corsOptions } from '@/app/lib/utils/cors';
import { sql } from '@/app/lib/db';
import { logTransaction, updateVoucherTopup } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';
import type { VoucherTopup } from '@/app/lib/types/voucher';

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nomor_id, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, topup_code, skipLog } = body;
        if (!nomor_id || !nama_pelanggan || !nomor_pelanggan || nominal == null || !topup_code) {
            return errorResponse(request, 'Missing required fields: nomor_id, nama_pelanggan, nomor_pelanggan, nominal, topup_code', 400);
        }
        if (typeof nomor_id !== 'string' || typeof nama_pelanggan !== 'string' || typeof nomor_pelanggan !== 'string' || typeof topup_code !== 'string') {
            return errorResponse(request, 'Invalid types: nomor_id, nama_pelanggan, nomor_pelanggan, topup_code must be strings', 400);
        }
        if (typeof nominal !== 'number' || nominal <= 0) {
            return errorResponse(request, 'Invalid nominal: must be a positive number', 400);
        }
        const emailPel = email_pelanggan || null;
        if (!skipLog) {
            await logTransaction(
                'VOUCHER TOPUP',
                'pending',
                `Topup voucher game untuk ${nomor_id}`,
                { nomor_id, nama_pelanggan, email_pelanggan: emailPel, nomor_pelanggan, nominal, topup_code }
            );
        }
        const topupData = await updateVoucherTopup(nomor_id, nama_pelanggan, emailPel, nomor_pelanggan, nominal, topup_code);
        return jsonResponse(request, {
            message: 'Data topup voucher game berhasil diupdate/dicatat',
            data: topupData,
        }, 201);
    } catch (error) {
        console.error('Error processing voucher topup:', error);
        return errorResponse(request, 'Failed to process voucher topup data', 500);
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nomorId = searchParams.get('nomor_id');
    const limit = nomorId ? 1 : Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    try {
        let rows: VoucherTopup[];
        if (nomorId) {
            rows = await sql`
                SELECT
                    id,
                    nomor_id,
                    nama_pelanggan,
                    email_pelanggan,
                    nomor_pelanggan,
                    nominal,
                    topup_code,
                    created_at AT TIME ZONE 'Asia/Jakarta' AS created_at,
                    updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
                FROM voucher_topups
                WHERE nomor_id = ${nomorId}
                ORDER BY created_at DESC
                LIMIT ${limit}
            ` as VoucherTopup[];
        } else {
            rows = await sql`
                SELECT
                    id,
                    nomor_id,
                    nama_pelanggan,
                    email_pelanggan,
                    nomor_pelanggan,
                    nominal,
                    topup_code,
                    created_at AT TIME ZONE 'Asia/Jakarta' AS created_at,
                    updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
                FROM voucher_topups
                ORDER BY created_at DESC
                LIMIT ${limit}
            ` as VoucherTopup[];
        }
        if (rows.length === 0) {
            return errorResponse(request, 'No topup data found matching the criteria', 404);
        }
        return jsonResponse(request, {
            pelanggan: rows, count: rows.length, filters: { nomor_id: nomorId || null }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error querying voucher topups:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            params: { nomor_id: nomorId, limit }
        });
        return errorResponse(request, 'Failed to query topup data', 500);
    }
}
