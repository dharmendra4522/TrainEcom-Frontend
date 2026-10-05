import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Banner, BannerResponse, CreateBannerRequest, UpdateBannerRequest } from '../models/setting.model';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private baseAPI = `${environment.apiBaseUrl}/banner`;
  private http = inject(HttpClient);

  // fetch all banners
  getAllBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.baseAPI}/all`);
  }

  // create a new banner
  createBanner(request: CreateBannerRequest): Observable<BannerResponse> {
    const formData = new FormData();
    formData.append('Title', request.title);
    if (request.description) {
      formData.append('Description', request.description);
    }
    formData.append('BannerImage', request.bannerImage);
    return this.http.post<BannerResponse>(`${this.baseAPI}/create`, formData);
  }

  // update a banner by id
  updateBanner(id: number, request: UpdateBannerRequest): Observable<BannerResponse> {
    const formData = new FormData();
    if (request.title) formData.append('Title', request.title);
    if (request.description) formData.append('Description', request.description);
    if (request.bannerImage) formData.append('BannerImage', request.bannerImage);
    return this.http.put<BannerResponse>(`${this.baseAPI}/${id}/update`, formData);
  }

  // delete a banner by id
  deleteBanner(id: number): Observable<BannerResponse> {
    return this.http.delete<BannerResponse>(`${this.baseAPI}/${id}/delete`);
  }

}
