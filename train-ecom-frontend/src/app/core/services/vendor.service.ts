import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Role } from '../models/auth.model';
import { AdminUserFilterParams, AdminUserListResponse } from '../models/user.model';
import {
  VendorDetails,
  VendorVerifyRequest,
  VendorVerifyResponse
} from '../models/vendor.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private verifyAPI = `${environment.apiBaseUrl}/admin/user`;
  private detailsAPI = `${environment.apiBaseUrl}/admin/vendors`;


  getVendors(
    filter?: AdminUserFilterParams
  ): Observable<AdminUserListResponse> {

    return this.userService.getAllUsers({
      ...filter,
      role: Role.Vendor
    });
  }

  updateVendorStatus(
    userId: number,
    requestData: VendorVerifyRequest
  ): Observable<VendorVerifyResponse> {
    const url = `${this.verifyAPI}/${userId}/verify`;
    return this.http.patch<VendorVerifyResponse>(url, requestData);
  }

  getVendorById(userId: number): Observable<VendorDetails> {
    const url = `${this.detailsAPI}/${userId}/details`;
    return this.http.get<VendorDetails>(url);
  }
}