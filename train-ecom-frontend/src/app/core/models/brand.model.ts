export interface Brand {
  id: string;
  name: string;
  description: string;
}

export interface CreateBrandRequest {
  name: string;
  description: string;
}

export interface UpdateBrandRequest {
  name: string;
  description: string;
}
