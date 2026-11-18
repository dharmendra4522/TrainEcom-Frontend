import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Address, UserProfile, UpdateProfilePayload, AdminUserFilterParams, AdminUserListResponse, UpdateUserStatusPayload } from '../models/user.model';
import { Observable, of, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { createVendorFormData } from '../../features/users/components/vendor-profile-edit/vendor-profile-edit.utils';
import {
  normalizeApprovalStatus,
  normalizeRole,
  normalizeVendorStatus,
} from '../utils/role.utils';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private profileUrl = `${environment.apiBaseUrl}/auth/profile`;
  private addressBaseUrl = `${environment.apiBaseUrl}/addresses`;

  private http = inject(HttpClient);
  private addressesCache: Address[] | null = null;

  clearCache(): void {
    this.addressesCache = null;
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.profileUrl);
  }

  updateUserProfile(
    profileData: Partial<UpdateProfilePayload>
  ): Observable<UserProfile> {
    const url = `${this.profileUrl}/update`;
    const formData = createVendorFormData(profileData);
    return this.http.patch<UserProfile>(url, formData);
  }

  getAllAddress(): Observable<Address[]> {
    if (this.addressesCache) {
      return of(this.addressesCache);
    }
    const url = `${this.addressBaseUrl}/all`;
    return this.http
      .get<Address[]>(url)
      .pipe(tap((addresses) => (this.addressesCache = addresses)));
  }

  addAddress(addressData: Address): Observable<Address> {
    const url = `${this.addressBaseUrl}/create`;
    return this.http
      .post<Address>(url, addressData)
      .pipe(tap(() => (this.addressesCache = null)));
  }

  updateAddress(id: number, addressData: Address): Observable<Address> {
    const url = `${this.addressBaseUrl}/update/${id}`;
    return this.http
      .put<Address>(url, addressData)
      .pipe(tap(() => (this.addressesCache = null)));
  }

  deleteAddress(id: number): Observable<void> {
    const url = `${this.addressBaseUrl}/delete/${id}`;
    return this.http
      .delete<void>(url)
      .pipe(tap(() => (this.addressesCache = null)));
  }

  setDefaultAddress(id: number): Observable<void> {
    const url = `${this.addressBaseUrl}/set-default/${id}`;
    return this.http
      .patch<void>(url, {})
      .pipe(tap(() => (this.addressesCache = null)));
  }


  // normalize the status, role, and approval status values to ensure they are in the correct format for API requests
  // Admin: Fetch all users
  getAllUsers(
    filter?: AdminUserFilterParams
  ): Observable<AdminUserListResponse> {
    let params = new HttpParams();
    if (filter) {
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      if (filter.searchField !== undefined) {
        params = params.set('searchField', filter.searchField.toString());
      }
      if (filter.requestField !== undefined) {
        params = params.set('requestField', filter.requestField.toString());
      }
      filter.requestFilterIds?.forEach((id) => {
        params = params.append('requestFilterIds', id.toString());
      })
      const normalizedRole = normalizeRole(filter.role);
      if (normalizedRole !== null) {
        params = params.set('role', String(normalizedRole));
      }
      filter.status?.forEach((status) => {
        const normalizedStatus = normalizeVendorStatus(status);

        if (normalizedStatus !== null) {
          params = params.append(
            'statusIds',
            normalizedStatus.toString()
          );
        }
      });
      const normalizedApproval = normalizeApprovalStatus(
        filter.approvalStatus,
      );
      if (normalizedApproval !== null) {
        params = params.set('approvalStatus', String(normalizedApproval));
      };
      filter.filterIds?.forEach((id) => {
        params = params.append('filterIds', id.toString());
      });
      filter.bussinessCategoriesIds?.forEach((id) => {
        params = params.append('bussinessCategoriesIds', id.toString());
      });
      if (filter.pageNumber !== undefined) {
        params = params.set('pageNumber', filter.pageNumber.toString());
      }
      if (filter.pageSize !== undefined) {
        params = params.set('pageSize', filter.pageSize.toString());
      }
    }
    const url = `${environment.apiBaseUrl}/admin/users/all`;
    return this.http.get<AdminUserListResponse>(url, { params });
  }

  // Admin: Update user status (block/unblock)
  updateUserStatus(
    userId: number,
    payload: UpdateUserStatusPayload,
  ): Observable<void> {
    const url = `${environment.apiBaseUrl}/users/${userId}/update-status`;
    return this.http.patch<void>(url, payload);
  }

  // delete api
  deleteUser(userId: number): Observable<{ status: boolean; message: string }> {
    const url = `${environment.apiBaseUrl}/users/${userId}/delete`;
    return this.http.delete<{ status: boolean; message: string }>(url);
  }
}
