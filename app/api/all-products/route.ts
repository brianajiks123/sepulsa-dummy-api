import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/app/lib/utils/cors";
import { productsData } from "@/app/lib/data/productsData";

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function GET(request: NextRequest) {
    return corsJson(request, { products: productsData.products });
}
