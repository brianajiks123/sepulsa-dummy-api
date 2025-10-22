export type Product = {
    name: string;
    icon: string;
    link: string;
};

export type ProductPreview = Product & {
    category: string;
    count?: number;
};
