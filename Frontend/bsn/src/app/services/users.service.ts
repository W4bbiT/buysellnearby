import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private BASE_URL = 'http://localhost:3000/api/user'; 
  
  private http = inject(HttpClient)

  constructor() { }

  signUp(user: any): Observable<any> {
    const url = `${this.BASE_URL}/signup`;
    return this.http.post<any>(url, user).pipe(
      delay(500), 
      catchError((error) => {
        console.error('Error signing up:', error);
        throw error;
      })
    );
  }

  signIn(credentials: { email: string; password: string }): Observable<any> {
    const url = `${this.BASE_URL}/signin`;
    return this.http.post<any>(url, credentials).pipe(
      delay(500), 
      catchError((error) => {
        console.error('Error signing in:', error);
        throw error;
      })
    );
  }

  getUserProfile(): Observable<any> {
    const url = `${this.BASE_URL}/profile`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 
    });
    return this.http.get<any>(url, { headers }).pipe(
      delay(500), 
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        throw error;
      })
    );
  }

  updateProfile(updatedUser: any): Observable<any> {
    const url = `${this.BASE_URL}/update-user`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 
    });
    return this.http.patch<any>(url, updatedUser, { headers }).pipe(
      delay(500), 
      catchError((error) => {
        console.error('Error updating user profile:', error);
        throw error;
      })
    );
  }
}
