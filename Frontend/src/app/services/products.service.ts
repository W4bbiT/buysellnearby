import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Product } from '../models/productModel'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Review } from '../models/reviewModel';

const AUTH_API = `https://azar-backend.onrender.com/api`

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(
    private http: HttpClient,
  ) { }
  // Get all products with pagination
  getAllProducts(page: number, limit: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<Product[]>(AUTH_API + '/product/', { params }).pipe(
      catchError(this.handleError)
    );
  }
  //get a product by id
  getOneProduct(pId: string): Observable<any> {
    return this.http.get<any>(AUTH_API + `/product/${pId}`).pipe(
      catchError(this.handleError)
    );
  }
  
  //top product limit 10
  getTopProducts(): Observable<Product> {
    return this.http.get<Product>(AUTH_API + `/product/top-products`).pipe(
      catchError(this.handleError)
    );
  }
  getFeaturedProduct(): Observable<Product> {
    return this.http.get<Product>(AUTH_API + `/product/featured-products`).pipe(
      catchError(this.handleError)
    );
  }
  //delete product
  deleteProduct(pId: String): Observable<any> {
    return this.http.delete(AUTH_API + `/admin/dp/${pId}`).pipe(
      catchError(this.handleError)
    );
  }
  //create a product listing
  createProduct(data: Product): Observable<Product> {
    return this.http.post<Product>(
      AUTH_API + '/admin/ap/',
      data,
      httpOptions,
    ).pipe(
      catchError(this.handleError)
    );
  }
  //edit product
  editProduct(pId: String, data: Product): Observable<Product> {
    return this.http.patch<Product>(
      AUTH_API + `/admin/up/${pId}`,
      data,
      httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }
  // search products by name
  searchProduct(productName: string): Observable<Product[]> {
    return this.http.get<Product[]>(AUTH_API + `/product/search?name=${productName}`).pipe(
      catchError(this.handleError)
    );
  }

  // search products by name
  searchCategory(categories: string[], page: number, limit: number): Observable<Product[]> {
    const combinedCategories = categories.join('-'); // Combine categories with hyphens
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<Product[]>(AUTH_API + `/product/category-search/${combinedCategories}`, { params }).pipe(
      catchError(this.handleError)
    );
  }


  // Get reviews for a product with pagination
  getProductReviews(pId: string, page: number, limit: number): Observable<Review> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<Review>(AUTH_API + `/product/${pId}/reviews`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Get reviews for a product with pagination
  getTopReviews(): Observable<any> {
    return this.http.get<any>(AUTH_API + '/user/review/get-top-reviews').pipe(
      catchError(this.handleError)
    );
  }
  // Handle errors
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }
}
