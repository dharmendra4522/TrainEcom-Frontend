import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { selectIsLoggedIn } from '../../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private readonly store = inject(Store);

  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  cardItems = JSON.parse(localStorage.getItem('cart') || '[]');


  // function to handle add to card count



  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }


}