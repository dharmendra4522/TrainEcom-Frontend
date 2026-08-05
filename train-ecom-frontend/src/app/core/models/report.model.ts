export interface SalesReportRequest {
    fromDate: string;
    toDate: string;
}

export interface topProducts {
    productId: string;
    productName: string;
    thumbnailUrl: string;
    quantitySold: number;
    totalSales: number;
}