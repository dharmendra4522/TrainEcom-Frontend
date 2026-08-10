import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { topProducts } from '../../../../core/models/report.model';
import { TableColumn } from '../../../../core/models/table.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.css'
})
export class SalesReportComponent {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private router = inject(Router);

  reportForm = this.fb.group({
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
  })

  topProductsFilterForm = this.fb.group({
    fromDate: [''], // Optional as per backend requirement
    toDate: [''],
    limit: [10, [Validators.required, Validators.min(1), Validators.max(50)]] // Default 10, max 50
  });

  maxDate: Date = new Date();
  isLoading: boolean = false;
  isTableLoading: boolean = false;
  topProducts: Record<string, unknown>[] = [];

  // helper function to convert date in backend format to a more readable format
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.fetchTopSellingProducts();
  }

  tableColumns: TableColumn[] = [
    { key: 'thumbnailUrl', label: 'Product image', type: 'image' },
    { key: 'productName', label: 'Product Name', type: 'text' },
    { key: 'quantitySold', label: 'Quantity Sold', type: 'text' },
    { key: 'totalSales', label: 'Total Sales', type: 'currency' }
  ]


  // Method to download the sales report based on the selected date range
  downloadReport(): void {
    if (this.reportForm.invalid) return;
    this.isLoading = true;

    const fromVal = this.reportForm.value.fromDate;
    const toVal = this.reportForm.value.toDate;

    const formattedFromDate = this.formatDate(fromVal!);
    const formattedToDate = this.formatDate(toVal!);

    this.reportService.generateSalesReport(formattedFromDate, formattedToDate).subscribe({
      next: (blob) => {
        this.isLoading = false;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SalesReport_${formattedFromDate}_to_${formattedToDate}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error downloading report:', err);
      }
    });
  }


  fetchTopSellingProducts(): void {
    if (this.topProductsFilterForm.invalid) return;

    const formValues = this.topProductsFilterForm.value;
    const fromDate = formValues.fromDate ? this.formatDate(formValues.fromDate) : undefined;
    const toDate = formValues.toDate ? this.formatDate(formValues.toDate) : undefined;
    const limit = Number(formValues.limit) || 10;

    this.isTableLoading = true;


    this.reportService.getTopSellingProducts(fromDate, toDate, limit).subscribe({
      next: (products) => {
        this.topProducts = products as unknown as Record<string, unknown>[];
        this.isTableLoading = false;

      },
      error: (err) => {
        this.isTableLoading = false;
        console.error('Error fetching top selling products:', err);
      }
    })
  }

  onTopProductRowClick(event: Record<string, unknown>): void {
    const rowData = (event['row'] || event) as Record<string, unknown>;
    const productId = (rowData['id'] || rowData['productId'] || rowData['_id']) as string;

    if (productId) {
      this.router.navigate([`/admin/products/view/${productId}`], {
        queryParams: { mode: 'view-only' } // Yeh flag batayega ki yeh read-only view hai
      });
    }
  }


  resetReportForm(): void {
    this.reportForm.reset({
      fromDate: null,
      toDate: null
    });
  }

  resetTopProductsFilter(): void {
    this.topProductsFilterForm.reset({
      fromDate: '',
      toDate: '',
      limit: 10
    });
    this.fetchTopSellingProducts();
  }
}
