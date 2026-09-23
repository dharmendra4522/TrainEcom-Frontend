import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { selectUserRole } from '../../../../core/store/auth/auth.selectors';
import { NotificationItem, NotificationType } from '../../../../core/models/notification.model';
import { NotificationStreamService } from '../../../../core/services/notification-stream.service';
import { Role } from '../../../../core/models/auth.model';
import { normalizeRole } from '../../../../core/utils/role.utils';

@Component({
  selector: 'app-notification-history',
  templateUrl: './notification-history.component.html',
  styleUrl: './notification-history.component.css'
})
export class NotificationHistoryComponent {
  private store = inject(Store);
  private notificationStream = inject(NotificationStreamService);

  private router = inject(Router);

  userRole$: Observable<string | number | null> = this.store.select(selectUserRole);
  activeTab: 'all' | 'unread' | 'order' | 'system' | 'broadcast' = 'all';
  notifications: NotificationItem[] = [];

  unreadCount: number = 0;
  totalRecords: number = 0;
  pageNumber: number = 1;
  pageSize: number = 20;
  loading: boolean = false;

  ngOnInit(): void {
    this.loadNotifications();
  }

  // Load notifications based on user role or other criteria
  loadNotifications(): void {
    this.loading = true;
    this.notificationStream.getAllNotifications(this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        this.notifications = response.items;
        this.unreadCount = response.unreadCount;
        this.totalRecords = response.totalRecords;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
        this.loading = false;
      }
    });
  }

  filteredNotifications(): NotificationItem[] {
    const visibleItems = this.notifications.filter(n => !n.isHidden);

    if (this.activeTab === 'unread') {
      return visibleItems.filter(n => !n.isRead);
    }
    if (this.activeTab === 'order') {
      return visibleItems.filter(n =>
        n.type === NotificationType.OrderPlaced ||
        n.type === NotificationType.OrderShipped ||
        n.type === NotificationType.OrderDelivered ||
        n.type === NotificationType.NewOrderPlaced
      );
    }
    if (this.activeTab === 'system') {
      return visibleItems.filter(n =>
        n.type === NotificationType.LowStock ||
        n.type === NotificationType.ProductOutOfStock ||
        n.type === NotificationType.NewCustomerRegistered
      );
    }
    if (this.activeTab === 'broadcast') {
      return visibleItems.filter(n => n.isBroadcast);
    }
    return visibleItems;
  }


  setTab(tab: 'all' | 'unread' | 'order' | 'system' | 'broadcast'): void {
    this.activeTab = tab;
  }

  handleNotificationClick(notification: NotificationItem): void {
    // 1. Mark as read if it's currently unread
    if (!notification.isRead) {
      this.notificationStream.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          if (this.unreadCount > 0) {
            this.unreadCount--;
          }
        },
        error: (err) => console.error('Failed to mark notification as read', err)
      });
    }

    // 2. Dynamic Redirect logic based on referenceType
    if (notification.referenceType && notification.referenceId) {
      this.userRole$.pipe(take(1)).subscribe(role => {
        const type = notification.referenceType as string;
        const id = notification.referenceId;
        const normalizedRole = normalizeRole(role as string | number | null | undefined);

        // Define route mappings dynamically
        const customerRoutes: Record<string, string> = {
          'Order': '/account/orders/customer-details',
          'Product': '/products',
        };

        const adminRoutes: Record<string, string> = {
          'Order': '/admin/orders/details',
          'Product': '/admin/products/view',
          'User': '/admin/users'
        };

        const routeMap = normalizedRole === Role.Admin ? adminRoutes : customerRoutes;
        const basePath = routeMap[type];

        if (basePath) {
          this.router.navigate([basePath, id]);
        } else {
          console.warn(`No route mapping found for referenceType: ${type}`);
        }
      });
    }
  }

  markAsRead(notification: NotificationItem, event: MouseEvent): void {
    event.stopPropagation();
    this.notificationStream.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        if (this.unreadCount > 0) {
          this.unreadCount--;
        }
      },
      error: (err) => console.error('Failed to mark notification as read', err)
    });
  }

  markAllAsRead(): void {
    const now = new Date().toISOString();
    this.notifications.forEach(n => {
      n.isRead = true;
      n.readAt = now;
    });
  }

  deleteNotification(id: string | number, event: MouseEvent): void {
    event.stopPropagation();
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clearAll(): void {
    this.notifications = [];
  }
}
