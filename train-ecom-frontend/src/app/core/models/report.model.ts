export interface SalesReportRequest {
    fromDate: string;
    toDate: string;
}

export interface TopProducts {
    productId: number;
    productName: string;
    thumbnailUrl: string;
    quantitySold: number;
    totalSales: number;
}