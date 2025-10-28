import { NextRequest } from 'next/server';
import { corsOptions } from '@/app/lib/utils/cors';
import { sql } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
            WHERE id = ${parseInt(id, 10)} 
            ORDER BY created_at DESC
        `;

        if (rows.length === 0) {
            return errorResponse(_request, 'Log entry not found', 404);
        }

        return jsonResponse(_request, { data: rows[0] });
    } catch (error) {
        console.error('Error fetching log:', error);
        return errorResponse(_request, 'Failed to fetch log', 500);
    }
}
