import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/userModel';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
    return this.http.get<User[]>(AUTH_API + 'user', { params }).pipe(
      catchError(this.handleError)
    );
  }
  // Get one user
  getOneUser(): Observable<User> {
    return this.http.get<User>(AUTH_API + 'user/profile').pipe(
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

