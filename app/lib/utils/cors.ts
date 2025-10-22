import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : [];

export const CORS_HEADERS = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
};

export function corsOptions(request: NextRequest) {
    const origin = request.headers.get("origin");
    console.log(`[CORS] Origin received: ${origin}`);
    const isAllowedOrigin = !origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV === "development" && allowedOrigins.length === 0);

    const headers = new Headers(CORS_HEADERS);
    if (isAllowedOrigin) {
        headers.set("Access-Control-Allow-Origin", origin || "*");
    }

    return new NextResponse(null, { status: 204, headers });
}

export function corsJson(request: NextRequest, data: unknown, status = 200) {
    const origin = request.headers.get("origin");
    const isAllowedOrigin = !origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV === "development" && allowedOrigins.length === 0);

    const headers = new Headers(CORS_HEADERS);
    if (isAllowedOrigin) {
        headers.set("Access-Control-Allow-Origin", origin || "*");
    }

    return NextResponse.json(data, { status, headers });
}
