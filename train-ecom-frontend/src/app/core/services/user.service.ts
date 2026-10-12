import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Address,
  UserProfile,
  UpdateProfilePayload,
  AdminUserFilterParams,
  AdminUserListResponse,
  UpdateUserStatusPayload,
  ApprovalStatus,
} from '../models/user.model';
import { Observable, of, tap, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Role } from '../models/auth.model';
import { VendorStatus } from '../models/vendor.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private profileUrl = `${environment.apiBaseUrl}/auth/profile`;
  private addressBaseUrl = `${environment.apiBaseUrl}/addresses`;

  private http = inject(HttpClient);
  private addressesCache: Address[] | null = null;

  constructor() { }

  clearCache(): void {
    this.addressesCache = null;
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.profileUrl).pipe(
      map((profile) => {
        if (profile.vendorDetails) {
          const vd = profile.vendorDetails as Record<string, unknown> &
            typeof profile.vendorDetails;
          if ('bussinessName' in vd)
            vd.bussinessName = vd['bussinessName'] as string;
          if ('bussinessDescription' in vd)
            vd.bussinessDescription = vd['bussinessDescription'] as string;
        }
        return profile;
      }),
    );
  }

  updateUserProfile(
    profileData: UpdateProfilePayload,
  ): Observable<UserProfile> {
    const url = `${this.profileUrl}/update`;
    const payload: UpdateProfilePayload = { ...profileData };
    if (payload.bussinessDetails) {
      const businessDetails = payload.bussinessDetails as Record<
        string,
        unknown
      >;
      businessDetails['bussinessName'] = payload.bussinessDetails.bussinessName;
      businessDetails['bussinessDescription'] =
        payload.bussinessDetails.bussinessDescription;
    }
    return this.http.put<UserProfile>(url, payload);
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
  public normalizeStatus(
    status: string | number | undefined,
  ): number | undefined {
    if (status === undefined || status === null || status === '') {
      return undefined;
    }
    if (typeof status === 'number') {
      return status;
    }
    const value = status.trim().toLowerCase();
    const statusMap: Record<string, number> = {
      active: VendorStatus.Active,
      pending: VendorStatus.Pending,
      rejected: VendorStatus.Rejected,
      blocked: VendorStatus.Blocked,
    };
    if (value === 'all') return undefined;
    const numericStatus = Number(value);
    return (
      statusMap[value] ??
      (Number.isFinite(numericStatus) ? numericStatus : undefined)
    );
  }

  private normalizeRole(
    role: Role | string | number | undefined,
  ): number | undefined {
    if (role === undefined || role === null || role === '') {
      return undefined;
    }
    if (typeof role === 'number') {
      return role;
    }
    const normalized = role.trim();
    const roleMap: Record<string, number> = {
      customer: Role.Customer,
      vendor: Role.Vendor,
      admin: Role.Admin,
      accounting: Role.Accounting,
      officeadmin: Role.OfficeAdmin,
    };
    return roleMap[normalized.toLowerCase()] ?? Number(normalized) ?? undefined;
  }

  private normalizeApprovalStatus(
    status: ApprovalStatus | string | number | undefined,
  ): number | undefined {
    if (status === undefined || status === null || status === '') {
      return undefined;
    }
    if (typeof status === 'number') {
      return status;
    }
    const normalized = status.trim().toLowerCase();
    const statusMap: Record<string, number> = {
      pending: ApprovalStatus.Pending,
      approved: ApprovalStatus.Approved,
      rejected: ApprovalStatus.Rejected,
    };
    return statusMap[normalized] ?? Number(normalized) ?? undefined;
  }

  // Admin: Fetch all users
  getAllUsers(
    filter?: AdminUserFilterParams,
  ): Observable<AdminUserListResponse> {
    let params = new HttpParams();
    if (filter) {
      if (filter.Search) {
        params = params.set('Search', filter.Search);
      }
      if (filter.SearchField !== undefined) {
        params = params.set('SearchField', filter.SearchField.toString());
      }
      if (filter.RequestField !== undefined) {
        params = params.set('RequestField', filter.RequestField.toString());
      }
      const normalizedRole = this.normalizeRole(filter.Role);
      if (normalizedRole !== undefined) {
        params = params.set('Role', String(normalizedRole));
      }
      filter.Status?.forEach((status) => {
        const normalizedStatus = this.normalizeStatus(status);

        if (normalizedStatus !== undefined) {
          params = params.append(
            'StatusIds',
            normalizedStatus.toString(),
          );
        }
      });
      const normalizedApproval = this.normalizeApprovalStatus(
        filter.ApprovalStatus,
      );
      if (normalizedApproval !== undefined) {
        params = params.set('ApprovalStatus', String(normalizedApproval));
      }
      filter.FilterIds?.forEach((id) => {
        params = params.append('FilterIds', id.toString());
      });
      filter.BusinessCategoriesIds?.forEach((id) => {
        params = params.append('BusinessCategoriesIds', id.toString());
      });
      if (filter.PageNumber !== undefined) {
        params = params.set('PageNumber', filter.PageNumber.toString());
      }
      if (filter.PageSize !== undefined) {
        params = params.set('PageSize', filter.PageSize.toString());
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
    const url = `${environment.apiBaseUrl}/admin/users/${userId}/update-status`;
    return this.http.patch<void>(url, payload);
  }

  // delete api
  deleteUser(userId: number): Observable<{ status: boolean; message: string }> {
    const url = `${environment.apiBaseUrl}/admin/users/${userId}/delete`;
    return this.http.delete<{ status: boolean; message: string }>(url);
  }
}
