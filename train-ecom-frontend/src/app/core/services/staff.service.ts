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
  private createStaffUserAPI = `${environment.apiBaseUrl}/users/create`;

  // api for create new staff user
  addStaffUsers(payload: CreateStaffUser): Observable<CreateStaffUserResponse> {
    return this.http.post<CreateStaffUserResponse>(`${this.createStaffUserAPI}`, payload);
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
      })
    }
    return this.http.get<StaffuserListResponse>(`${this.baseAPI}/staff/users/all`, { params });
  }
}
