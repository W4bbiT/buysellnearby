import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay } from 'rxjs';
import { Product } from '../models/product';

const BASE_URL = 'http://localhost:3000/api'

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private http = inject(HttpClient)

  constructor() { }

  getAllProducts(page = 1, filter = '', minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER, sort = '-createdOn'): Observable<Product[]> {
    const url = `${BASE_URL}/product?page=${page}&filter=${filter}&minPrice=${minPrice}&maxPrice=${maxPrice}&sort=${sort}`;
    return this.http.get<Product[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching products:', error);
        throw error;
      }),
      delay(500),
    );
  }

  getProductDetails(productId: string): Observable<Product> {
    return this.http.get<Product>(`${BASE_URL}/product/${productId}`);
  }

}
