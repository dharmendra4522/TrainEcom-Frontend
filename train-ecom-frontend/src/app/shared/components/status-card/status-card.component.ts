import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { interval, map, Observable, Subscription, takeWhile } from 'rxjs';

import {
  selectAuthStatus,
  selectRegistrationId,
  selectSubmittedDate,
} from '../../../core/store/auth/auth.selectors';
import { Router } from '@angular/router';
import { approvalStatusToLabel } from '../../../core/utils/role.utils';

@Component({
  selector: 'app-status-card',
  templateUrl: './status-card.component.html',
  styleUrl: './status-card.component.css',
})
export class StatusCardComponent {
  private store = inject(Store);
  private route = inject(Router);

  submittedDate$: Observable<string | null> =
    this.store.select(selectSubmittedDate);
  registrationId$: Observable<string | null> =
    this.store.select(selectRegistrationId);
  status$: Observable<string | null> = this.store.select(selectAuthStatus);

  shortReg(regId: string | null): string {
    if (!regId) return '';
    if (regId.length > 8) {
      regId = regId.substring(0, 8).toUpperCase();
    }
    return regId;
  }

  getStatusLabel(status: string | number | null | undefined): string {
    return approvalStatusToLabel(status);
  }

  get localRegistrationId(): string | null {
    return localStorage.getItem('registrationId');
  }

  get localSubmittedDate(): string | null {
    return localStorage.getItem('submittedDate');
  }

  get localStatus(): string | null {
    return localStorage.getItem('vendorStatus');
  }
}
