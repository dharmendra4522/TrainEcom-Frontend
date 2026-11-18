import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationResponse } from '../models/notification.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class NotificationStreamService {
  private http = inject(HttpClient);
  private BASEAPI = `${environment.apiBaseUrl}/notifications`;

  getAllNotifications(pageNumber: number, pageSize: number): Observable<NotificationResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<NotificationResponse>(`${this.BASEAPI}/getAll`, { params });
  }

  markAsRead(notificationId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.BASEAPI}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.BASEAPI}/read-all`, {});
  }

  hideNotification(notificationId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.BASEAPI}/${notificationId}/hide`, {});
  }

}
