import { Component, inject } from '@angular/core';
import { TableAction, TableColumn, TableActionEvent } from '../../../../core/models/table.model';
import { BannerService } from '../../../../core/services/banner.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Banner, BannerResponse } from '../../../../core/models/setting.model';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import { AddUpdateBannerComponent } from '../add-update-banner/add-update-banner.component';

@Component({
  selector: 'app-banner-management',
  templateUrl: './banner-management.component.html',
  styleUrl: './banner-management.component.css'
})
export class BannerManagementComponent {
  private bannerService = inject(BannerService);
  private notificationService = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private dialog = inject(MatDialog);

  // dummy data for banners, to be replaced with API data
  public banners: Banner[] = [];
  public isLoading: boolean = false;

  // for table columns and actions
  columns: TableColumn[] = [
    { key: 'bannerUrl', label: 'Banner', type: 'image' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'text', truncate: true }
  ]

  // for table actions
  actions: TableAction[] = [
    { actionKey: 'edit', label: 'Edit', icon: 'edit', color: 'primary' },
    { actionKey: 'delete', label: 'Delete', icon: 'delete', color: 'warn' }
  ]

  ngOnInit(): void {
    this.fetchAllBanners();
  }

  // fetch all banners
  fetchAllBanners(): void {
    this.bannerService.getAllBanners().subscribe({
      next: (response: Banner[]) => {
        this.banners = response;
      }, error: (error) => {
        console.error('Error fetching banners:', error);
        this.notificationService.showError('Failed to fetch banners. Please try again later.');
      }
    })
  }

  // get formatted banners for table display
  getFormattedBanners(): Record<string, unknown>[] {
    return this.banners as unknown as Record<string, unknown>[];
  }

  // handle table action
  onTableAction(event: TableActionEvent,): void {
    if (event.action === 'edit') {
      const banner = event.row as Banner;
      const dialogRef = this.dialog.open(AddUpdateBannerComponent, {
        width: '500px',
        data: banner,
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.notificationService.showSuccess('Banner updated successfully.');
          this.fetchAllBanners();
        }
      })
    } else if (event.action === 'delete') {
      const banner = event.row as Banner;
      this.confirmDialog.confirm(`Are you sure you want to delete the banner "${banner.title}"?`, 'Yes', 'No').subscribe({
        next: (confirmed) => {
          if (confirmed) {
            this.onDeleteBanner(banner.id);
          }
        }
      });
    }
  }


  // handle add banner action
  onAddBanner(): void {
    const dialogRef = this.dialog.open(AddUpdateBannerComponent, {
      width: '500px',
      data: null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.showSuccess('Banner added successfully.');
        this.fetchAllBanners();
      }
    })
  }

  // delete banner
  onDeleteBanner(bannerId: number): void {
    this.bannerService.deleteBanner(bannerId).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Banner deleted successfully.');
        this.fetchAllBanners();

      }, error: (error) => {
        this.notificationService.showError('Failed to delete banner. Please try again later.');
      }
    })
  }

}
