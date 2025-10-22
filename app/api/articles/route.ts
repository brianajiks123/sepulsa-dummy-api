import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/app/lib/utils/cors";
import { articlesData } from "@/app/lib/data/articlesData";

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function GET(request: NextRequest) {
    return corsJson(request, { articles: articlesData });
}
