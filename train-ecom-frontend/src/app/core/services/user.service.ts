import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Address, UserProfile } from '../models/user.model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiBaseUrl = `${environment.apiBaseUrl}/Auth/profile`;
  private addressUrl = `${environment.apiBaseUrl}/users/address`;

  private http = inject(HttpClient);

  constructor() { }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiBaseUrl);
  }

  updateUserProfile(profileData: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiBaseUrl, profileData);
  }

  getAllAddress(): Observable<Address[]> {
    return this.http.get<Address[]>(this.addressUrl);
  }

  addAddress(addressData: Address): Observable<Address> {
    return this.http.post<Address>(this.addressUrl, addressData);
  }

  updateAddress(Id: string, addressData: Address): Observable<Address> {
    const url = `${this.addressUrl}/${Id}`;
    return this.http.put<Address>(url, addressData);
  }

  deleteAddress(Id: string): Observable<void> {
    const url = `${this.addressUrl}/${Id}`;
    return this.http.delete<void>(url);
  }

}
