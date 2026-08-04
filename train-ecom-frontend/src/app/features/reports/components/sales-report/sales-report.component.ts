import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.css'
})
export class SalesReportComponent {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);

  reportForm = this.fb.group({
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required]
  })


  isLoading: boolean = false;

  // Method to download the sales report based on the selected date range
  downloadReport(): void {
    if (this.reportForm.invalid) return;
    this.isLoading = true;

    // because the backend expects the dates in 'YYYY-MM-DD' format, we can directly use the values from the form as they are already in that format.
    const fromDate = this.reportForm.value.fromDate as string;
    const toDate = this.reportForm.value.toDate as string;

    this.reportService.generateSalesReport(fromDate, toDate).subscribe({
      next: (blob) => {
        this.isLoading = false;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SalesReport_${fromDate}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error downloading report:', err);
      }
    })
  }


}
