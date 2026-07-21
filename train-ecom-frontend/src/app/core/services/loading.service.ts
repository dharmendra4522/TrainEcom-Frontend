import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable().pipe(delay(0));

  private requestCount = 0;

  show(): void {
    this.requestCount++;
    if(this.requestCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide(): void {
    if(this.requestCount > 0) {
      this.requestCount--;
    }
    if(this.requestCount === 0) {
      this.loadingSubject.next(false);
    }
  }

}
