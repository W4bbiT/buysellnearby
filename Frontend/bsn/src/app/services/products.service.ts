import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

const BASE_URL = 'http://localhost:8100/api/'

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private http = inject(HttpClient)

  constructor() { }

  getAllProducts(page = 1, filter = '', minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER, sort = '-createdOn') {
    return this.http.get(`${BASE_URL}/products?page=${page}&filter=${filter}&minPrice=${minPrice}&maxPrice=${maxPrice}&sort=${sort}`);
  }



  getProductsNearby(longitude: number, latitude: number, radius: number) {
    return this.http.get(`${BASE_URL}/products/nearby/${longitude}/${latitude}?radius=${radius}`);
  }

}
