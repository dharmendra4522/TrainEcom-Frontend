import { Component, inject } from '@angular/core';
import { VendorService } from '../../../../core/services/vendor.service';
import { ActivatedRoute } from '@angular/router';
import { VendorDetails } from '../../../../core/models/vendor.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent {
  private vendorService = inject(VendorService);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  private vendorId: string = '';
  vendorDetails: VendorDetails | null = null;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.fetchVendorId();
    if (this.vendorId) {
      this.loadVendorDetail();
    }
  }

  private fetchVendorId(): string {
    this.route.paramMap.subscribe((params) => {
      this.vendorId = params.get('id') || '';
    });
    return this.vendorId;
  }

  private loadVendorDetail(): void {
    this.isLoading = true;
    this.vendorService.getVendorById(this.vendorId).subscribe({
      next: (response) => {
        this.vendorDetails = response;
        console.log(this.vendorDetails);
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.showError('Faild to load vendor details');
        this.isLoading = false;
      },
    });
  }
}
