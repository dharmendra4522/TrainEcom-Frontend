import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { MenuItem } from '../../../core/models/menu-item.model';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import * as AuthActions from '../../../core/store/auth/auth.actions';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private store = inject(Store);
  private notification = inject(NotificationService);
  private router = inject(Router);

  @Input() menuItems: MenuItem[] = [];
  @Input() title: string = 'Menu';
  @Input() sidebarType: string = 'admin';

   onLogout(): void {
      this.store.dispatch(AuthActions.logout());
    }
}
