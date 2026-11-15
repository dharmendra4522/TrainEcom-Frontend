import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateStaffUser, CreateStaffUserResponse, StaffUserFilter, StaffuserListResponse } from '../models/staffUser.model';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private http = inject(HttpClient);
  private baseAPI = `${environment.apiBaseUrl}/vendors`
  private staffUserAPI = `${environment.apiBaseUrl}/users`;

  // api for create new staff user
  addStaffUsers(payload: CreateStaffUser): Observable<CreateStaffUserResponse> {
    return this.http.post<CreateStaffUserResponse>(`${this.staffUserAPI}/create`, payload);
  }

  // api to fetch all the staff users
  fetchStaffUsers(filter: StaffUserFilter): Observable<StaffuserListResponse> {
    let params = new HttpParams();
    params = params.set('pageNumber', filter.pageNumber);
    params = params.set('pageSize', filter.pageSize);
    if (filter.searchTerm) {
      params = params.set('search', filter.searchTerm);
    }
    if (filter.searchField !== undefined) {
      params = params.set('searchField', filter.searchField);
    }
    if (filter.roleFilter?.length) {
      filter.roleFilter.forEach(role => {
        params = params.append('roleFilter', role)
      });
    }
    if (filter.statusFilter?.length) {
      filter.statusFilter.forEach(status => {
        params = params.append('statusFilter', status)
      });
    }
    return this.http.get<StaffuserListResponse>(`${this.baseAPI}/staff/users/all`, { params });
  }

  // update staff user details api
  updateStaffUserDetails(userId: number, payload: Partial<CreateStaffUser>): Observable<CreateStaffUserResponse> {
    return this.http.put<CreateStaffUserResponse>(`${this.staffUserAPI}/${userId}/update`, payload);
  }

  // update staff user status api
  updateStaffUserStatus(userId: number, isBlocked: boolean): Observable<CreateStaffUserResponse> {
    const payload = { isBlocked };
    return this.http.patch<CreateStaffUserResponse>(`${this.staffUserAPI}/${userId}/update-status`, payload);
  }

  // delete staff user api
  deleteStaffUser(userId: number): Observable<CreateStaffUserResponse> {
    return this.http.delete<CreateStaffUserResponse>(`${this.staffUserAPI}/${userId}/delete`);
  }


}
