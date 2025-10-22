import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/app/lib/utils/cors";
import { productsData } from "@/app/lib/data/productsData";
import type { ProductPreview } from "@/app/lib/types/product";

export async function OPTIONS(request: NextRequest) {
    return corsOptions(request);
}

export async function GET(request: NextRequest) {
    const allCategories = Object.entries(productsData.products);
    const displayedProducts: ProductPreview[] = [];

    for (const [category, items] of allCategories) {
        if (!Array.isArray(items) || items.length === 0) continue;
        const takeCount = ["Telekomunikasi", "Bayar Tagihan"].includes(category) ? 2 : 1;
        const limited = items.slice(0, takeCount);
        for (const p of limited) displayedProducts.push({ ...p, category });
    }

    const totalProducts = allCategories.reduce((s, [, items]) => s + (Array.isArray(items) ? items.length : 0), 0);
    const remainingCount = Math.max(totalProducts - displayedProducts.length, 0);

    displayedProducts.push({
        name: "Lainnya",
        icon: "/icons/products/lainnya.svg",
        link: "/product",
        category: "Lainnya",
        count: remainingCount,
    });

    return corsJson(request, { products: displayedProducts });
}
