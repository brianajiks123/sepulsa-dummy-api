export type PlnCustomer = {
    id: number;
    id_pelanggan: string;
    nama_pelanggan: string;
    email_pelanggan?: string;
    nomor_pelanggan?: string;
    nominal: number;
    created_at: string;
    updated_at: string;
}

export type PlnToken = {
    id: number;
    nomor_meter: string;
    nama_pelanggan: string;
    email_pelanggan?: string;
    nomor_pelanggan?: string;
    nominal: number;
    token_number?: string;
    created_at: string;
    updated_at: string;
}
