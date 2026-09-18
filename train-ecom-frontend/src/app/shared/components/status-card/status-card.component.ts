import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { interval, map, Observable, Subscription, takeWhile } from 'rxjs';

import {
  selectAuthStatus,
  selectRegistrationId,
  selectSubmittedDate,
} from '../../../core/store/auth/auth.selectors';
import { Router } from '@angular/router';

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

  private readonly TIMER_DURATION_MS: number = 5 * 60 * 1000;
  private timerSubscription?: Subscription;

  reminingSecond: number = 5 * 60;
  formattedTime: string = '05:00';
  isTimeExpire: boolean = false;

  ngOnInit(): void {
    this.startCount();
  }

  private startCount(): void {
    let expireTime = localStorage.getItem('vendor_session_expiry');
    if (!expireTime) {
      const newExpire = new Date().getTime() + this.TIMER_DURATION_MS;
      localStorage.setItem('vendor_session_expiry', newExpire.toString());
      expireTime = newExpire.toString();
    }
    const targetTime = parseInt(expireTime, 10);

    this.timerSubscription = interval(1000)
      .pipe(
        map(() => {
          const now = new Date().getTime();
          const remainingMg = targetTime - now;
          return Math.max(0, Math.floor(remainingMg / 1000));
        }),
        takeWhile((timeLeft: number) => timeLeft >= 0),
      )
      .subscribe({
        next: (timeLeft: number) => {
          this.reminingSecond = timeLeft;
          this.formattedTime = this.formateTime(this.reminingSecond);
          if (this.reminingSecond === 0) {
            this.isTimeExpire = true;
            this.route.navigate(['/login']);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('vendorStatus');
            localStorage.removeItem('vendor_session_expiry');
          }
        },
      });
  }

  private formateTime(totalSecond: number): string {
    const min: number = Math.floor(totalSecond / 60);
    const sec: number = totalSecond % 60;
    const padMin: string = min < 10 ? `0${min}` : `${min}`;
    const padSec: string = sec < 10 ? `0${sec}` : `${sec}`;
    return `${padMin}:${padSec}`;
  }

  shortReg(regId: string | null): string {
    if (!regId) return '';
    if (regId.length > 8) {
      regId = regId.substring(0, 8).toUpperCase();
    }
    return regId;
  }

  get localRegistrationId(): string | null {
    return localStorage.getItem('registrationId');
  }

  get localSubmittedDate(): string | null {
    return localStorage.getItem('submittedDate');
  }

  get localStatus(): string | null {
    return localStorage.getItem('vendorStatusDetail');
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
