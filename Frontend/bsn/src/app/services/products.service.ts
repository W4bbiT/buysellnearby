import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay } from 'rxjs';
import { ApiResponse, Product } from '../models/product';

const BASE_URL = 'http://localhost:3000/api/product'

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private http = inject(HttpClient)

  constructor() { }

  getAllProducts(page = 1, filter = '', minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER, sort = '-createdOn'): Observable<ApiResponse> {
    const url = `${BASE_URL}?page=${page}&filter=${filter}&minPrice=${minPrice}&maxPrice=${maxPrice}&sort=${sort}`;
    return this.http.get<ApiResponse>(url).pipe(
      catchError((error) => {
        console.error('Error fetching products:', error);
        throw error;
      }),
    );
  }

  getProductDetails(productId: string): Observable<any> {
    const url = `${BASE_URL}/${encodeURIComponent(productId)}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error fetching product:', error);
        throw error;
      }),
      delay(500),
    );
  }

  searchByName(name: string, page = 1, limit = 10): Observable<ApiResponse> {
    const url = `${BASE_URL}/search?name=${name}&page=${page}&limit=${limit}`;
    return this.http.get<ApiResponse>(url).pipe(
      catchError((error) => {
        console.error('Error searching by name:', error);
        throw error;
      }),
      delay(500),
    );
  }

  searchByCategory(categories: string, page = 1, limit = 50): Observable<ApiResponse> {
    const url = `${BASE_URL}/category-search/${categories}?page=${page}&limit=${limit}`;
    return this.http.get<ApiResponse>(url).pipe(
      catchError((error) => {
        console.error('Error searching by category:', error);
        throw error;
      }),
      delay(500),
    );
  }

  addProduct(productData: any): Observable<any> {
    const url = `${BASE_URL}/create`;
    return this.http.post<any>(url, productData).pipe(
      catchError((error) => {
        console.error('Error adding product:', error);
        throw error;
      }),
      delay(500),
    );
  }

  editProduct(productId: string, productData: any): Observable<any> {
    const url = `${BASE_URL}/edit/${productId}`;
    return this.http.patch<any>(url, productData).pipe(
      catchError((error) => {
        console.error('Error editing product:', error);
        throw error;
      }),
      delay(500),
    );
  }

  deleteProduct(productId: string): Observable<any> {
    const url = `${BASE_URL}/delete/${productId}`;
    return this.http.delete<any>(url).pipe(
      catchError((error) => {
        console.error('Error deleting product:', error);
        throw error;
      }),
      delay(500),
    );
  }

  deleteProductImage(productId: string, imageIndex: number): Observable<any> {
    const url = `${BASE_URL}/delete-image/${productId}/${imageIndex}`;
    return this.http.delete<any>(url).pipe(
      catchError((error) => {
        console.error('Error deleting product image:', error);
        throw error;
      }),
      delay(500),
    );
  }

}
