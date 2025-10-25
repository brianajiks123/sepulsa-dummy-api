import { NextRequest } from "next/server";
import { corsJson } from "./cors";

export function jsonResponse<T>(request: NextRequest, data: T, status: number = 200) {
    return corsJson(request, {
        success: status >= 200 && status < 300,
        status,
        data,
    }, status);
}

export function errorResponse(request: NextRequest, message: string, status: number = 400) {
    return corsJson(request, {
        success: false,
        status,
        error: {
            message,
        },
    }, status);
}

export function successResponse(request: NextRequest, message: string, status: number = 200) {
    return corsJson(request, {
        success: true,
        status,
        message,
    }, status);
}
