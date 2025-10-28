import { NextRequest } from 'next/server';
import { corsOptions } from '@/app/lib/utils/cors';
import { sql } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '10';
        const offset = searchParams.get('offset') || '0';

        const { rows } = await sql`
            SELECT 
                id, 
                timestamp AT TIME ZONE 'Asia/Jakarta' AS timestamp,
                transaction_type, 
                status, 
                message, 
                details, 
                created_at AT TIME ZONE 'Asia/Jakarta' AS created_at
            FROM log 
            ORDER BY created_at DESC 
            LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}
        `;

        return jsonResponse(request, { data: rows, count: rows.length });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return errorResponse(request, 'Failed to fetch logs', 500);
    }
}
