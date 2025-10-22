import { NextResponse } from "next/server";
import { CORS_HEADERS } from "./cors";

export function jsonResponse<T>(data: T, status: number = 200) {
    return NextResponse.json(
        {
            success: status >= 200 && status < 300,
            status,
            data,
        },
        {
            status,
            headers: CORS_HEADERS,
        }
    );
}

export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json(
        {
            success: false,
            status,
            error: {
                message,
            },
        },
        {
            status,
            headers: CORS_HEADERS,
        }
    );
}

export function successResponse(message: string, status: number = 200) {
    return NextResponse.json(
        {
            success: true,
            status,
            message,
        },
        {
            status,
            headers: CORS_HEADERS,
        }
    );
}
