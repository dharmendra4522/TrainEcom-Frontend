import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { VendorProfileUpdateListResponse, VerifyProfileRequestPayload, VerifyProfileResponse } from '../models/request-approve.model';

@Injectable({
  providedIn: 'root'
})
export class RequestApprovalService {
  private http = inject(HttpClient);
  private baseAPI = environment.apiBaseUrl;


  // handle fetch list of vendor request 
  fetchRequestList(pageNumber: number, pageSize: number, searchTerm?: string, statusFilter?: number): Observable<VendorProfileUpdateListResponse> {
    let params: Record<string, string | number> = {
      pageNumber,
      pageSize
    }
    if (searchTerm?.trim()) {
      params['search'] = searchTerm.trim();
    }
    if (statusFilter) {
      params['statusFilter'] = statusFilter;
    }
    return this.http.get<VendorProfileUpdateListResponse>(`${this.baseAPI}/requests/all`, { params });
  }

  // handle verify request
  verifyRequest(userId: number, payload: VerifyProfileRequestPayload): Observable<VerifyProfileResponse> {
    return this.http.put<VerifyProfileResponse>(`${this.baseAPI}/requests/verify/users/${userId}`, payload)
  }

}
