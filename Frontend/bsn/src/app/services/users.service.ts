import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})

export class UsersService {
  private BASE_URL = 'http://localhost:3000/api/user'; 

  private storage = inject(Storage);
  private _storage: Storage | null = null;
  private http = inject(HttpClient)

  constructor() {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  getUserProfile(): Observable<any> {
    const url = `${this.BASE_URL}/profile`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.storage.get('access_token')}`, 
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
      'Authorization': `Bearer ${this.storage.get('access_token')}`, 
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
