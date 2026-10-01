export interface Banner {
  id: number;
  title: string;
  description: string;
  bannerUrl: string;
}


export interface CreateBannerRequest {
  title: string;
  description?: string;
  bannerImage: File;
}

export interface BannerResponse {
  status: boolean;
  message: string;
}

export interface UpdateBannerRequest {
  title?: string;
  description?: string;
  bannerImage?: File;
}
