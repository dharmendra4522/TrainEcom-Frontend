import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Address, UserProfile, UpdateProfilePayload } from '../models/user.model';
import { Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
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
    return this.http.get<UserProfile>(this.profileUrl);
  }

  updateUserProfile(profileData: UpdateProfilePayload): Observable<UserProfile> {
    const url = `${this.profileUrl}/update`;
    return this.http.put<UserProfile>(url, profileData);
  }

  getAllAddress(): Observable<Address[]> {
    if (this.addressesCache) {
      return of(this.addressesCache);
    }
    const url = `${this.addressBaseUrl}/all`;
    return this.http.get<Address[]>(url).pipe(
      tap((addresses) => this.addressesCache = addresses)
    );
  }

  addAddress(addressData: Address): Observable<Address> {
    const url = `${this.addressBaseUrl}/create`;
    return this.http.post<Address>(url, addressData).pipe(
      tap(() => this.addressesCache = null)
    );
  }

  updateAddress(Id: string, addressData: Address): Observable<Address> {
    const url = `${this.addressBaseUrl}/update/${Id}`;
    return this.http.put<Address>(url, addressData).pipe(
      tap(() => this.addressesCache = null)
    );
  }

  deleteAddress(Id: string): Observable<void> {
    const url = `${this.addressBaseUrl}/delete/${Id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => this.addressesCache = null)
    );
  }

  setDefaultAddress(Id: string): Observable<void> {
    const url = `${this.addressBaseUrl}/set-default/${Id}`;
    return this.http.patch<void>(url, {}).pipe(
      tap(() => this.addressesCache = null)
    );
  }

}