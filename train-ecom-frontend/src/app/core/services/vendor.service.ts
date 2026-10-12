import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '../models/auth.model';
import {
  AdminUserListResponse,
  AdminUser,
  AdminUserFilterParams,
} from '../models/user.model';
import {
  VendorDetails,
  VendorItem,
  VendorListResponse,
  VendorVerifyRequest,
  VendorVerifyResponse,
  VendorStatus,
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

  getVendors(filter?: AdminUserFilterParams): Observable<VendorListResponse> {
    const vendorFilter: AdminUserFilterParams = {
      Search: filter?.Search,
      SearchField: filter?.SearchField,
      RequestField: filter?.RequestField,
      Role: Role.Vendor,
      Status: filter?.Status,
      ApprovalStatus: filter?.ApprovalStatus,
      FilterIds: filter?.FilterIds,
      BusinessCategoriesIds: filter?.BusinessCategoriesIds,
      PageNumber: filter?.PageNumber,
      PageSize: filter?.PageSize,
    };

    return this.userService.getAllUsers(vendorFilter).pipe(
      map((response: AdminUserListResponse): VendorListResponse => ({
        ...response,
        items: response.items.map((item) => this.toVendorItem(item)),
      })),
    );
  }

  private toVendorItem(item: AdminUser): VendorItem {
    const business = item.bussinessDetail;
    const categories = business?.bussinessCategories ?? [];

    return {
      vendorId: item.userId,
      userId: item.userId,
      name: item.name,
      businessName: business?.bussinessName ?? item.name ?? 'N/A',
      email: item.email,
      phoneNumber: item.phoneNumber,
      city: business?.city ?? '',
      productCount: item.productCount,
      storeName: business?.storeName,
      gstin: business?.gstin,
      pan: business?.pan,
      status: item.status ?? VendorStatus.Pending,
      approvalStatus: item.approvalStatus ?? undefined,
      isBlocked:
        item.isBlocked === true || item.status === VendorStatus.Blocked,
      rejectionReason: business?.rejectionReason ?? null,
      categories,
      businessDetail: business
        ? {
          businessName: business.bussinessName,
          categories,
          storeName: business.storeName,
          gstin: business.gstin,
          pan: business.pan,
          city: business.city,
          rejectionReason: business.rejectionReason ?? null,
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