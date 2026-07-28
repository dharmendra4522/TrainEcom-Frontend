import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  constructor() { }

  showSuccess(message: string, action: string = 'Close') {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    })
  }

  showError(message: string, action: string = 'Close'){
    this.snackBar.open(message, action, {
      duration: 4000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    })
  }

  showInfo(message: string, action: string = 'Close'){
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    })
  }

  showWarning(message: string, action: string = 'Close'){
    this.snackBar.open(message, action, {
      duration: 3500,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    })
  }
}
