import { Component, inject } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { UserProfile } from '../../../core/models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);

  userProfile: UserProfile | null = null;
  isLoading: boolean = true;
  isEditMode: boolean = false;

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.formInit();
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (data: UserProfile) => {
        this.userProfile = data;
        this.profileForm.patchValue({
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
        })
        this.isLoading = false;
        console.log('User profile loaded:', this.userProfile);
      }, error: (err) => {
        console.error('Error loading user profile:', err);
        this.isLoading = false;
      }
    })
  }

  formInit(): void {
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode && this.userProfile) {
      this.profileForm.patchValue(this.userProfile);
    }
  }


  onSubmit(): void {
    if (this.profileForm.valid) {
      this.userService.updateUserProfile(this.profileForm.value).subscribe({
        next: (updatedProfile: UserProfile) => {
          if(this.userProfile){
            this.userProfile.name = updatedProfile.name;
            this.userProfile.phoneNumber = updatedProfile.phoneNumber
          } else{
            this.userProfile = updatedProfile;
          }
          this.profileForm.patchValue({
            name: updatedProfile.name,
            phoneNumber: updatedProfile.phoneNumber,
          });
          this.isEditMode = false;
          console.log('Profile updated successfully:', this.userProfile);
        },
        error: (err) => {
          console.error('Error updating profile:', err);
        }
      });
    }
  }
}
