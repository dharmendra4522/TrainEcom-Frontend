import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SidePanelItem } from '../side-panel/side-panel.component';

@Component({
  selector: 'app-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.css',
})
export class NotificationCardComponent {
  @Input() item!: SidePanelItem;

  @Output() notificationClick = new EventEmitter<SidePanelItem>();
  @Output() removeNotification = new EventEmitter<string | number>();

  onClick(): void {
    this.notificationClick.emit(this.item);
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.removeNotification.emit(this.item.id);
  }

}
