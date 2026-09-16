export interface SalesReportRequest {
    fromDate: string;
    toDate: string;
}

export interface TopProducts {
    productId: string;
    productName: string;
    thumbnailUrl: string;
    quantitySold: number;
    totalSales: number;
}