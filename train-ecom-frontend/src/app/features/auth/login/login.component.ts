import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAuthError } from '../../../core/store/auth/auth.selectors';
import * as AuthActions from '../../../core/store/auth/auth.actions'; // Action import kiya

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  private store = inject(Store);
  private fb = inject(FormBuilder);

  error$ = this.store.select(selectAuthError);

  ngOnInit() {
    this.validateForm();
  }

  private validateForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    this.store.dispatch(AuthActions.loginReq({ request: this.loginForm.value }));
  }
}