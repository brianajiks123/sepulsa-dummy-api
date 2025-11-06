import { NextRequest } from 'next/server';
import { corsOptions } from '@/app/lib/utils/cors';
import { sql } from '@/app/lib/db';
import { logTransaction, updateVoucherCustomer } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';
import type { VoucherCustomer } from '@/app/lib/types/voucher';

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_pelanggan, nama_pelanggan, email_pelanggan, nomor_pelanggan, nominal, skipLog } = body;
        if (!id_pelanggan || !nama_pelanggan || !nomor_pelanggan || nominal == null) {
            return errorResponse(request, 'Missing required fields: id_pelanggan, nama_pelanggan, nomor_pelanggan, nominal', 400);
        }
        if (typeof id_pelanggan !== 'string' || typeof nama_pelanggan !== 'string' || typeof nomor_pelanggan !== 'string') {
            return errorResponse(request, 'Invalid types: fields must be strings', 400);
        }
        const email = email_pelanggan || null;
        if (typeof nominal !== 'number' || nominal <= 0) {
            return errorResponse(request, 'Invalid nominal: must be a positive number', 400);
        }
        if (!skipLog) {
            await logTransaction(
                'VOUCHER GAME',
                'pending',
                `Pembelian voucher game untuk ${nomor_pelanggan}`,
                { id_pelanggan, nama_pelanggan, email_pelanggan: email, nomor_pelanggan, nominal }
            );
        }
        const customer = await updateVoucherCustomer(id_pelanggan, nama_pelanggan, email, nomor_pelanggan, nominal);
        return jsonResponse(request, { message: 'Data pelanggan voucher game berhasil diupdate/dicatat', data: customer }, 201);
    } catch (error) {
        console.error('Error processing voucher game:', error);
        return errorResponse(request, 'Failed to process voucher game data', 500);
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nomorPelanggan = searchParams.get('nomor_pelanggan');
    const idPelanggan = searchParams.get('id_pelanggan');
    const limit = idPelanggan ? 1 : Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    try {
        let rows: VoucherCustomer[];
        if (nomorPelanggan && idPelanggan) {
            rows = await sql`
                SELECT
                    id,
                    id_pelanggan,
                    nama_pelanggan,
                    email_pelanggan,
                    nomor_pelanggan,
                    nominal,
                    created_at AT TIME ZONE 'Asia/Jakarta' AS created_at,
                    updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
                FROM voucher_customers
                WHERE nomor_pelanggan = ${nomorPelanggan} AND id_pelanggan = ${idPelanggan}
                ORDER BY created_at DESC
                LIMIT ${limit}
            ` as VoucherCustomer[];
        } else if (nomorPelanggan) {
            rows = await sql`
                SELECT
                    id,
                    id_pelanggan,
                    nama_pelanggan,
                    email_pelanggan,
                    nomor_pelanggan,
                    nominal,
                    created_at AT TIME ZONE 'Asia/Jakarta' AS created_at,
                    updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
                FROM voucher_customers
                WHERE nomor_pelanggan = ${nomorPelanggan}
                ORDER BY created_at DESC
                LIMIT ${limit}
            ` as VoucherCustomer[];
        } else if (idPelanggan) {
            rows = await sql`
                SELECT
                    id,
                    id_pelanggan,
                    nama_pelanggan,
                    email_pelanggan,
                    nomor_pelanggan,
                    nominal,
                    created_at AT TIME ZONE 'Asia/Jakarta' AS created_at,
                    updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
                FROM voucher_customers
                WHERE id_pelanggan = ${idPelanggan}
                ORDER BY created_at DESC
                LIMIT ${limit}
            ` as VoucherCustomer[];
        } else {
            rows = await sql`
                SELECT
                    id,
                    id_pelanggan,
                    nama_pelanggan,
                    email_pelanggan,
                    nomor_pelanggan,
                    nominal,
                    created_at AT TIME ZONE 'Asia/Jakarta' AS created_at,
                    updated_at AT TIME ZONE 'Asia/Jakarta' AS updated_at
                FROM voucher_customers
                ORDER BY created_at DESC
                LIMIT ${limit}
            ` as VoucherCustomer[];
        }
        if (rows.length === 0) {
            return errorResponse(request, 'No pelanggan found matching the criteria', 404);
        }
        return jsonResponse(request, {
            pelanggan: rows, count: rows.length, filters: { nomor_pelanggan: nomorPelanggan || null, id_pelanggan: idPelanggan || null }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error querying voucher customers:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            params: { nomor_pelanggan: nomorPelanggan, id_pelanggan: idPelanggan, limit }
        });
        return errorResponse(request, 'Failed to query pelanggan data', 500);
    }
}
