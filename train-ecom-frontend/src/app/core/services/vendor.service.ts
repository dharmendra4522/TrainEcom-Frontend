import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '../models/auth.model';
import { ApprovalStatus, AdminUserListResponse, AdminUser } from '../models/user.model';
import {
  VendorDetails,
  VendorListResponse,
  VendorVerifyRequest,
  VendorVerifyResponse,
} from '../models/vendor.model';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private http = inject(HttpClient);
  private listAPI = `${environment.apiBaseUrl}/admin/users/all`;
  private verifyAPI = `${environment.apiBaseUrl}/admin/user`;
  private detailsAPI = `${environment.apiBaseUrl}/admin/vendors`;

  constructor() {}

  getVendors(filter?: {
    search?: string;
    status?: ApprovalStatus | number | string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<VendorListResponse> {
    let params = new HttpParams().set('Role', String(Role.Vendor));

    if (filter?.search) {
      params = params.set('Search', filter.search);
    }
    if (filter?.status !== undefined && filter?.status !== null && filter?.status !== '' && filter?.status !== 'All') {
      params = params.set('ApprovalStatus', String(filter.status));
    }
    if (filter?.pageNumber !== undefined) {
      params = params.set('PageNumber', String(filter.pageNumber));
    }
    if (filter?.pageSize !== undefined) {
      params = params.set('PageSize', String(filter.pageSize));
    }

    return this.http.get<AdminUserListResponse>(this.listAPI, { params }).pipe(
      map((response: AdminUserListResponse) => {
        const items = Array.isArray(response?.items) ? response.items : [];
        return {
          items: items.map((item: AdminUser) => ({
            vendorId: Number(item.userId ?? item['vendorId'] ?? item['id']),
            bussinessName: (item['businessDetail'] as { businessName?: string })?.businessName || (item['bussinessName'] as string) || item.name || 'N/A',
            email: item.email,
            phoneNumber: item.phoneNumber,
            city: (item['address'] as { city?: string })?.city || (item['businessDetail'] as { city?: string })?.city || '',
            status: (item.approvalStatus as ApprovalStatus) ?? ApprovalStatus.Pending,
          })),
          pageNumber: response?.pageNumber ?? 1,
          pageSize: response?.pageSize ?? items.length,
          totalRecords: response?.totalRecords ?? items.length,
          totalPages: response?.totalPages ?? 1,
        };
      }),
    );
  }

  updateVendorStatus(
    userId: number,
    requestData: VendorVerifyRequest,
  ): Observable<VendorVerifyResponse> {
    const url = `${this.verifyAPI}/${userId}/verify`;
    return this.http.patch<VendorVerifyResponse>(url, requestData);
  }

  getVendorById(userId: number): Observable<VendorDetails> {
    const url = `${this.detailsAPI}/${userId}/details`;
    return this.http.get<VendorDetails>(url);
  }
}

