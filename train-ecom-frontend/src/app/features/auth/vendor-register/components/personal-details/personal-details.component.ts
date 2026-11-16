import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getFieldError, trimControlValue } from '../../../register.utils';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.css',
})
export class PersonalDetailsComponent {
  private notificationService = inject(NotificationService);

  @Input() registerForm!: FormGroup;
  @Input() isStep1Valid: boolean = false;
  @Input() isPasswordView: boolean = false;
  @Input() isConfirmPassView: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() isPasswordChangeMode: boolean = false;
  @Input() currentProfileImage: string | null = null;
  
  selectedImage: File | null = null;
  previewImage: string | null = null;

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
  @Output() imageSelected = new EventEmitter<File>();

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

  // Method to handle image selection
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.selectedImage = null;
      return;
    }
    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      this.notificationService.showError('Only JPG, JPEG, PNG and WEBP images are allowed');
      return;
    }
    if (file.size > maxFileSize) {
      this.notificationService.showError('File size should not exceed 3MB');
      return;
    }
    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
    this.imageSelected.emit(file);
  }
}
