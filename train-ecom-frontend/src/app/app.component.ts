import { selectUserRole } from './core/store/auth/auth.selectors';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from './core/store/auth/auth.actions';
import { jwtDecode } from 'jwt-decode';
import { Role } from './core/models/auth.model';
import * as UserActions from './core/store/user/user.actions';

interface DecodedToken {
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: Role;
  role?: Role;
  Role?: Role;
  exp?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'train-ecom-frontend';

  private store = inject(Store);

  ngOnInit() {
    this.restoreUserSession();
  }

  private restoreUserSession(): void {
    const token = localStorage.getItem('accessToken');

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
        const role: Role | null = decoded[roleKey] || decoded.role || decoded.Role || null;
        this.store.dispatch(AuthActions.loginSuccess({
          payload: { token, role,
            registrationId: localStorage.getItem('registrationId'),
            submittedDate: localStorage.getItem('submittedDate'),
            approvalStatus: null,
            status: localStorage.getItem('vendorStatus'),
           },
          isRefresh: true
        }));
        this.store.dispatch(UserActions.loadProfileReq());

      } catch (error) {
        console.error('Token decoding failed', error);
        localStorage.removeItem('accessToken');
        this.store.dispatch(AuthActions.logout());
      }
    }
  }
}