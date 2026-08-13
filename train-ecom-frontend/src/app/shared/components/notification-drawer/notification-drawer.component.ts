import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NotificationItem } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-drawer',
  templateUrl: './notification-drawer.component.html',
  styleUrl: './notification-drawer.component.css'
})
export class NotificationDrawerComponent {
  @Input() Notifications: NotificationItem[] = [];
  @Input() isOpen: boolean = false;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<string>();
  @Output() markAllAsRead = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();


  onItemClick(id: string): void {
    this.markAsRead.emit(id);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }

  deleteNotification(id: string): void {
    this.markAsRead.emit(id);
  }
  onClose(): void {
    this.closeDrawer.emit();
  }
}
