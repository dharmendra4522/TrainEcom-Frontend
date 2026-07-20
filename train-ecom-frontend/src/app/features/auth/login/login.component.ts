import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAuthError } from '../../../core/store/auth/auth.selectors';
import * as AuthActions from '../../../core/store/auth/auth.actions'; // Action import kiya
import { map } from 'rxjs/internal/operators/map';
import { BackendError } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  private store = inject(Store);
  private fb = inject(FormBuilder);
  isShowingPassword = false;

  error$ = this.store.select(selectAuthError).pipe(
    map(err => {
      if (!err) return null; 

      let errorMessage = 'An unexpected error occurred';

      if (typeof err === 'string') {
        errorMessage = err;
      } else if (typeof err === 'object') {
        const errorObj = err as BackendError; 
        errorMessage = errorObj?.error?.message || errorObj?.message || errorMessage;
      }

      if (errorMessage.includes('0 Unknown Error')) return 'Unable to connect to the server...';
      if (errorMessage.toLowerCase().includes('unauthorized')) return 'Incorrect Email or Password...';
      
      return errorMessage; 
    })
  );

  ngOnInit() {
    this.validateForm();
  }

  private validateForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    this.store.dispatch(
      AuthActions.loginReq({ request: this.loginForm.value }),
    );
  }

  togglePasswordVisibility() {
    this.isShowingPassword = !this.isShowingPassword;
  }

}
