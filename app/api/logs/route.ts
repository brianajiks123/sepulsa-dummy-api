import { NextRequest } from 'next/server';
import { corsOptions } from '@/app/lib/utils/cors';
import { query, LogRow } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '10';
        const offset = searchParams.get('offset') || '0';

        const rows: LogRow[] = await query<LogRow>`
      SELECT * FROM log 
      ORDER BY created_at DESC 
      LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}
    `;

        return jsonResponse({ data: rows, count: rows.length });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return errorResponse('Failed to fetch logs', 500);
    }
}
