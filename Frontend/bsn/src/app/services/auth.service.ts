import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { BehaviorSubject, Observable, catchError, delay } from 'rxjs';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import * as moment from 'moment';

const AUTH_API = 'http://localhost:3000/api/user';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user: Observable<any> | undefined;
  private http = inject(HttpClient);
  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  toke = '';

  constructor(
    private tokenService: TokenStorageService,
    private router: Router
  ) {
    this.loadToken();
  }

  async loadToken() {
    const token = await this.tokenService.get("accessToken");
    if (token) {
      console.log("Token found. User is authenticated.");
      this.isAuthenticated.next(true);
    } else {
      console.log("Token not found. User is not authenticated.");
      this.isAuthenticated.next(false);
    }
  }

  signUp(user: any): Observable<any> {
    const url = `${AUTH_API}/signup`;
    return this.http.post<any>(url, user).pipe(
      catchError((error) => {
        console.error('Error signing up:', error);
        console.error('Server response:', error.error);
        throw error;
      })
    );
  }

  async signIn(credentials: { email: string; password: string }) {
    if (!credentials) {
      console.log("Invalid credentials!");
      return "Invalid Credentials";
    }

    const options = {
      url: `${AUTH_API}/signin`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(credentials),
    }

    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      const res = response.data;

      if (res && res.accessToken) {
        console.log("ExpiresIn value:", res.expiresIn);
        const expiresAt = moment().add(res.expiresIn, 'seconds');        
        this.tokenService.set("accessToken", res.accessToken);
        this.tokenService.set('expiresIn', expiresAt.unix()); 
        this.tokenService.set('role', res.role);
        this.tokenService.set('username', res.username);
        this.isAuthenticated.next(true);
        console.log("User signed in successfully.");
        console.log(res);
        this.router.navigateByUrl('/profile', { replaceUrl: true })
      } else {
        console.log("Invalid credentials!");
        return "Invalid Credentials";
      }
    } catch (e) {
      console.error("An error occurred during sign-in:", e);
      console.log("Invalid credentials!");
      return;
    }
    return;
  }
 
  async isUserAuthenticated() {
    const token = await this.tokenService.get("accessToken");
    const expiresIn = await this.tokenService.get("expiresIn");
    if (!token) {
      console.log("User not authenticated: Token not found.");
      return false;
    }
    var isExpired = this.isTokenExpired(expiresIn);
    if (isExpired === true) {
      console.log("User not authenticated: Token is expired.");
      return false;
    } else {
      console.log("User is authenticated.");
      return true;
    }
  }

  private isTokenExpired(expiresIn: any) {
    const expirationTimeInSeconds = parseInt(expiresIn, 10);
    const expirationTime = moment.unix(expirationTimeInSeconds);
    const currentTime = moment();
    console.log("Current Time:", currentTime);
    console.log("Expiration Time:", expirationTime);
    const isTokenValid = expirationTime.isAfter(currentTime);
    console.log("Is token valid:", isTokenValid);
    return !isTokenValid;
  }

  async isAdmin() {
    if (await this.isUserAuthenticated()) {
      const role = await this.tokenService.get("role");
      if (role === 'STAR') {
        console.log("User is an admin.");
        return true;
      }
      console.log("User is not an admin.");
      return false;
    }
    console.log("User not authenticated.");
    return false;
  }

  async signOut() {
    this.isAuthenticated.next(false);
    await this.tokenService.remove("accessToken");
    await this.tokenService.remove("expiresIn");
    await this.tokenService.remove("role");
    await this.tokenService.remove("username");
    await this.tokenService.clean();
    console.log("User signed out successfully.");
    this.router.navigateByUrl('/sign-in', { replaceUrl: true })
  }
}
