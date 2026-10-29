import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getFieldError, trimControlValue } from '../../../register.utils';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.css'
})
export class PersonalDetailsComponent {
  @Input() registerForm!: FormGroup;
  @Input() isStep1Valid: boolean = false;
  @Input() isPasswordView: boolean = false;
  @Input() isConfirmPassView: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() isPasswordChangeMode: boolean = false;

  // Naye flags edit mode ke password fields ke liye
  @Input() isOldPassView: boolean = false;
  @Input() isNewPassView: boolean = false;
  @Input() isEditConfirmPassView: boolean = false;

  @Output() togglePassword = new EventEmitter<void>();
  @Output() toggleConfirmPassword = new EventEmitter<void>();
  @Output() togglePasswordChange = new EventEmitter<void>();

  // Naye outputs
  @Output() toggleOldPassword = new EventEmitter<void>();
  @Output() toggleNewPassword = new EventEmitter<void>();
  @Output() toggleEditConfirmPassword = new EventEmitter<void>();

  @Output() next = new EventEmitter<void>();

  onTogglePassword(): void { this.togglePassword.emit(); }
  onToggleConfirmPassword(): void { this.toggleConfirmPassword.emit(); }
  onTogglePasswordChange(): void { this.togglePasswordChange.emit(); }

  onToggleOldPassword(): void { this.toggleOldPassword.emit(); }
  onToggleNewPassword(): void { this.toggleNewPassword.emit(); }
  onToggleEditConfirmPassword(): void { this.toggleEditConfirmPassword.emit(); }

  onNext(): void { this.next.emit(); }
  getErrorMessage(controlName: string, label: string): string {
    const control = this.registerForm.get(controlName);
    return getFieldError(control, label);
  }
  onBlurTrim(controlName: string): void {
    const control = this.registerForm.get(controlName);
    trimControlValue(control);
  }
}
