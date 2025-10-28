export interface PlnCustomer {
    id: number;
    id_pelanggan: string;
    nama_pelanggan: string;
    nomor_pelanggan: string;
    nominal: number;
    created_at: string;
}

export interface PlnToken {
    id: number;
    nomor_meter: string;
    nama_pelanggan: string;
    nominal: number;
    token_number?: string;
    created_at: string;
}
