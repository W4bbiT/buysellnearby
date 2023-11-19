import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/userModel';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Cart } from '../models/cartModel';
import { Order } from '../models/orderModel';
import { Review } from '../models/reviewModel';

// const AUTH_API = `https://azar-backend.onrender.com/api`
const AUTH_API = `http://localhost:3000/api`

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  // Get all users with pagination
  getAllUsers(page: number, limit: number): Observable<User[]> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<User[]>(AUTH_API + '/user', { params }).pipe(
      catchError(this.handleError)
    );
  }
  // Get one user
  getOneUser(): Observable<User> {
    return this.http.get<User>(AUTH_API + '/user/profile').pipe(
      catchError(this.handleError)
    );
  }

  // Delete user
  deleteUser(id: string): Observable<any> {
    return this.http.delete(AUTH_API + `/admin/du/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create a user
  createUser(data: User): Observable<User> {
    return this.http.post<User>(AUTH_API + '/user/register', data, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Edit user
  editUser(data: User): Observable<User> {
    return this.http.patch<User>(AUTH_API + '/user/update-user', data, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  //addreview and rating
  addReview(pId: string, data: Review): Observable<Review> {
    console.log("Id: " + pId + "rating: " + data.rating + "review: "+ data.review)
    return this.http.post<Review>(
      AUTH_API + `/user/review/add-review/${pId}`,
      data,
      httpOptions
    ).pipe(
      catchError(this.handleError)
    )
  }

  // Get cart for user
  getCartForUser(): Observable<Cart> {
    return this.http.get<Cart>(AUTH_API + '/user/cart').pipe(
      catchError(this.handleError)
    );
  }

  // Add a product to cart
  addProductToMyCart(pid: string, data: Cart): Observable<Cart> {
    return this.http.post<Cart>(AUTH_API + `/user/addtocart/${pid}`, data, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Update cart
  updateCart(pid: string, data: Cart): Observable<Cart> {
    return this.http.patch<Cart>(AUTH_API + `/user/editcart/${pid}`, data, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a product from cart
  pullProductFromCart(pid: string): Observable<any> {
    return this.http.delete(AUTH_API + `/user/delete-item/${pid}`).pipe(
      catchError(this.handleError)
    );
  }

  // Checkout cart
  checkoutCart(): Observable<any> {
    return this.http.post<any>(AUTH_API + '/user/orders', httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  emptyCart(): Observable<any> {
    return this.http.delete<any>(AUTH_API + '/user/empty-cart', httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Get orders for this user
  getOrderForThisUser(): Observable<Order[]> {
    return this.http.get<Order[]>(AUTH_API + '/user/orders').pipe(
      catchError(this.handleError)
    );
  }

  getOneOrder(oId: string): Observable<Order> {
    return this.http.get<Order>(AUTH_API + `/user/orders/${oId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Handle errors
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

