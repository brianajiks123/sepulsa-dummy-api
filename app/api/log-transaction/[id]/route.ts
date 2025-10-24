import { NextRequest } from 'next/server';
import { corsOptions } from '@/app/lib/utils/cors';
import { query } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';
import type { RowDataPacket } from 'mysql2';

interface LogRow extends RowDataPacket {
    id: number;
    timestamp: string;
    transaction_type: string;
    status: 'success' | 'failed';
    message: string;
    details: string | null;
    created_at: string;
}

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const rows: LogRow[] = await query<LogRow>('SELECT * FROM log WHERE id = ? ORDER BY created_at DESC', [id]);

        if (rows.length === 0) {
            return errorResponse('Log entry not found', 404);
        }

        return jsonResponse({ data: rows[0] });
    } catch (error) {
        console.error('Error fetching log:', error);
        return errorResponse('Failed to fetch log', 500);
    }
}
