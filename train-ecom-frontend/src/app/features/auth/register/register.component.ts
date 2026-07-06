import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private routes: Router) { }

  ngOnInit() {
    this.validateForm();
  }

  private validateForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }


  onSubmit() {
    if (this.registerForm.invalid) {
      console.log('Form is invalid');
      return;
    }
    console.log(this.registerForm.value);
    this.routes.navigate(['/auth/login']);
  }
}
