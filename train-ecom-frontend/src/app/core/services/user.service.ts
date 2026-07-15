import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Address, UserProfile, UpdateProfilePayload } from '../models/user.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private profileUrl = `${environment.apiBaseUrl}/auth/profile`;
  private addressBaseUrl = `${environment.apiBaseUrl}/addresses`;

  private http = inject(HttpClient);

  constructor() { }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.profileUrl);
  }

  updateUserProfile(profileData: UpdateProfilePayload): Observable<UserProfile> {
    const url = `${this.profileUrl}/update`;
    return this.http.put<UserProfile>(url, profileData);
  }

  getAllAddress(): Observable<Address[]> {
    const url = `${this.addressBaseUrl}/all`;
    return this.http.get<Address[]>(url);
  }

  addAddress(addressData: Address): Observable<Address> {
    const url = `${this.addressBaseUrl}/create`;
    return this.http.post<Address>(url, addressData);
  }

  updateAddress(Id: string, addressData: Address): Observable<Address> {
    const url = `${this.addressBaseUrl}/update/${Id}`;
    return this.http.put<Address>(url, addressData);
  }

  deleteAddress(Id: string): Observable<void> {
    const url = `${this.addressBaseUrl}/delete/${Id}`;
    return this.http.delete<void>(url);
  }

  setDefaultAddress(Id: string): Observable<void> {
    const url = `${this.addressBaseUrl}/set-default/${Id}`;
    return this.http.patch<void>(url, {});
  }

}