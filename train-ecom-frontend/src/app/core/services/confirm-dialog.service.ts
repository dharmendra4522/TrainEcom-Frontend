import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogServiceService {
  constructor(private dialog: MatDialog) {}

  confirm(
    message: string,
    yesLabel: string = 'Yes',
    noLabel: string = 'No',
  ): Observable<boolean> {
    const data: ConfirmDialogData = { message, yesLabel, noLabel };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data,
      disableClose: true,
    });

    return dialogRef.afterClosed();
  }
}
