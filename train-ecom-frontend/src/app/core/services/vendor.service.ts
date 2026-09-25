import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '../models/auth.model';
import {
  ApprovalStatus,
  AdminUserListResponse,
  AdminUser,
  AdminUserFilterParams,
  UserStatusFilter,
} from '../models/user.model';
import {
  VendorDetails,
  VendorItem,
  VendorListResponse,
  VendorVerifyRequest,
  VendorVerifyResponse,
  VendorFilterParams,
} from '../models/vendor.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private verifyAPI = `${environment.apiBaseUrl}/admin/user`;
  private detailsAPI = `${environment.apiBaseUrl}/admin/vendors`;

  constructor() { }

  getVendors(filter?: VendorFilterParams): Observable<VendorListResponse> {
    const vendorFilter: AdminUserFilterParams = {
      Search: filter?.search,
      Role: Role.Vendor,
      approvalStatus: filter?.status === 'All' ? undefined : filter?.status,
      UserStatus: this.toUserStatus(filter?.isBlocked),
      PageNumber: filter?.pageNumber,
      PageSize: filter?.pageSize,
    };

    return this.userService.getAllUsers(vendorFilter).pipe(
      map((response: AdminUserListResponse): VendorListResponse => ({
        ...response,
        items: response.items.map((item) => this.toVendorItem(item)),
      })),
    );
  }

  private toUserStatus(
    status: VendorFilterParams['isBlocked'],
  ): UserStatusFilter | undefined {
    if (status === undefined || status === 'All') {
      return undefined;
    }
    if (typeof status === 'boolean') {
      return status ? UserStatusFilter.Blocked : UserStatusFilter.Active;
    }
    return typeof status === 'string' ? Number(status) : status;
  }

  private toVendorItem(item: AdminUser): VendorItem {
    const business = item.businessDetail || item.bussinessDetail;
    const categories =
      business?.bussinessCategories ||
      business?.businessCategories ||
      item.categories ||
      item.bussinessCategories ||
      [];

    return {
      vendorId: item.userId,
      userId: item.userId,
      name: item.name,
      bussinessName:
        business?.bussinessName ||
        business?.businessName ||
        item.bussinessName ||
        item.name ||
        'N/A',
      email: item.email,
      phoneNumber: item.phoneNumber,
      city: business?.city || item.address?.city || '',
      status: item.approvalStatus ?? ApprovalStatus.Pending,
      isBlocked: item.isBlocked,
      categories,
      bussinessDetail: business
        ? {
            bussinessName: business.bussinessName || business.businessName,
            bussinessCategories: categories,
          }
        : undefined,
    };
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