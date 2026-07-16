import { Component, EventEmitter, inject, Input, Output, output } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { selectIsLoggedIn, selectUserRole } from '../../../core/store/auth/auth.selectors';
import { selectUserProfile } from '../../../core/store/user/use.selectors';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private readonly store = inject(Store);

  @Input() showMenuButton: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  userRole$ = this.store.select(selectUserRole);  
  userProfile$ = this.store.select(selectUserProfile);

  cardItems = JSON.parse(localStorage.getItem('cart') || '[]');


  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }


}