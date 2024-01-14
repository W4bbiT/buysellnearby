import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { BehaviorSubject, Observable, catchError, delay } from 'rxjs';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import * as moment from 'moment';

const AUTH_API = 'http://localhost:3000/api/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user: Observable<any> | undefined;
  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  toke = '';

  constructor(
    private tokenService: TokenStorageService,
    private router: Router
  ) {
    this.loadToken();
  }

  private async loadToken() {
    try {
      const token = await this.tokenService.get("accessToken");
      if (token) {
        console.log("Token found. User is authenticated.");
        this.isAuthenticated.next(true);
      } else {
        console.log("Token not found. User is not authenticated.");
        this.isAuthenticated.next(false);
      }
    } catch (error) {
      console.error('Error loading token:', error);
      this.router.navigateByUrl('/login', { replaceUrl: true })
    }
  }

  async signUp(user: any): Promise<void> {
    const options = {
      url: `${AUTH_API}/signup`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(user),
    }
    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (!response.data) {
        console.error('Error signing up:', response);
        throw new Error("There is something wrong");
      }
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  }

  async signIn(credentials: { email: string; password: string }): Promise<void> {
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
        this.tokenService.set("refreshToken", res.refreshToken);
        this.tokenService.set('expiresIn', expiresAt.unix());
        this.tokenService.set('role', res.role);
        this.tokenService.set('username', res.username);
        this.isAuthenticated.next(true);
        console.log("User signed in successfully.");
        console.log(res);
        this.router.navigateByUrl('/profile', { replaceUrl: true })
      } else {
        console.log("Invalid credentials!");
        throw new Error("Invalid Credentials");
      }
    } catch (error) {
      console.error("An error occurred during sign-in:", error);
      throw error;
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const refreshToken = await this.tokenService.get("refreshToken");
      if (!refreshToken) {
        throw new Error("Refresh token not found");
      }
      const options = {
        url: `${AUTH_API}/refresh-token`,
        headers: { 'Content-Type': 'application/json' },
        data: { refreshToken },
      }
      const response: HttpResponse = await CapacitorHttp.post(options);
      const res = response.data;
      const newAccessToken = res.accessToken;
      const expiresIn = res.expiresIn;
      const expiresAt = moment().add(expiresIn, 'seconds');
      this.tokenService.set("accessToken", newAccessToken);
      this.tokenService.set('expiresIn', expiresAt.unix());
      console.log("Access token refreshed successfully.");
    } catch (error) {
      console.error("Error refreshing access token:", error);
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  async isUserAuthenticated(): Promise<boolean> {
    try {
      const token = await this.tokenService.get("accessToken");
      const expiresIn = await this.tokenService.get("expiresIn");
      if (!token) {
        this.isAuthenticated.next(false);
        console.log("User not authenticated: Token not found.");
        return false;
      }
      var isExpired = this.isTokenExpired(expiresIn);
      if (isExpired === true) {
        this.isAuthenticated.next(false);
        console.log("User not authenticated: Token is expired.");
        return false;
      } else {
        console.log("User is authenticated.");
        this.isAuthenticated.next(true);
        return true;
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      throw error;
    }
  }

  async isAdmin(): Promise<boolean> {
    try {
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
    } catch (error) {
      console.error('Error checking admin status:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    this.isAuthenticated.next(false);
    await this.tokenService.remove("accessToken");
    await this.tokenService.remove("expiresIn");
    await this.tokenService.remove("role");
    await this.tokenService.remove("username");
    await this.tokenService.clean();
    console.log("User signed out successfully.");
    this.router.navigateByUrl('/login', { replaceUrl: true })
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
}
