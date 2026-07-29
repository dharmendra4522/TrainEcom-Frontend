import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { OrderHistoryFilterParams, OrderHistoryResponse } from '../models/order-history.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private baseAPI = `${environment.apiBaseUrl}/orders/history`;

  private http = inject(HttpClient);


  constructor() { }

  getAllOrderHistory(filter?: OrderHistoryFilterParams): Observable<OrderHistoryResponse> {
    let params = new HttpParams();
    if(filter){
      if(filter.fromDate){
        params = params.set('fromDate', filter.fromDate);
      }
      if(filter.toDate){
        params = params.set('toDate', filter.toDate);
      }
      if(filter.orderStatus){
        params = params.set('orderStatus', filter.orderStatus);
      }
      if(filter.pageNumber !== undefined){
        params = params.set('pageNumber', filter.pageNumber.toString());
      }
      if(filter.pageSize !== undefined){
        params = params.set('pageSize', filter.pageSize.toString());
      }
    }
    return this.http.get<OrderHistoryResponse>(this.baseAPI, { params });
  }
}
