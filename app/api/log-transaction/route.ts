import { NextRequest } from 'next/server';
import { corsOptions } from "@/app/lib/utils/cors";
import { logTransaction } from '@/app/lib/db';
import { jsonResponse, errorResponse } from '@/app/lib/utils/response';

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transaction_type, status, message, details } = body;

        if (!transaction_type || !status || !message) {
            return errorResponse('Missing required fields: transaction_type, status, message', 400);
        }

        if (!['success', 'failed'].includes(status)) {
            return errorResponse('Invalid status. Must be "success" or "failed"', 400);
        }

        await logTransaction(transaction_type, status, message, details);

        return jsonResponse({ message: 'Transaction logged successfully' }, 201);
    } catch (error) {
        console.error('Error logging transaction:', error);
        return errorResponse('Failed to log transaction', 500);
    }
}
