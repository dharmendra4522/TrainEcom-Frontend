import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from './core/store/auth/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'train-ecom-frontend';

  private store = inject(Store);

  ngOnInit() {
    const token = localStorage.getItem('accessToken');

    if (token) {
      this.store.dispatch(AuthActions.loginSuccess({
        response: { access_token: token, refresh_token: '' }
      }));
    }
  }
}