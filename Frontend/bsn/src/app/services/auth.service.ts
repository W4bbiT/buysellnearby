// Importing only the necessary modules to reduce bundle size
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import * as moment from 'moment';
import { TokenStorageService } from './token-storage.service';

const AUTH_API = 'http://localhost:3000/api/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // Removed unused 'user' property

  constructor(
    private tokenService: TokenStorageService,
    private router: Router
  ) {
    this.loadToken();
  }

  private async loadToken() {
    try {
      const token = await this.tokenService.get("accessToken");
      this.isAuthenticated.next(!!token); // Use boolean coercion for better readability
    } catch (error) {
      console.error('Error loading token:', error);
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  async signUp(user: any): Promise<void> {
    const options = {
      url: `${AUTH_API}/signup`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(user),
    };
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
    };
    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      const res = response.data;
      if (res && res.accessToken) {
        this.handleSignInSuccess(res);
      } else {
        console.log("Invalid credentials!");
        throw new Error("Invalid Credentials");
      }
    } catch (error) {
      console.error("An error occurred during sign-in:", error);
      throw error;
    }
  }

  private handleSignInSuccess(res: any) {
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
    this.router.navigateByUrl('/profile', { replaceUrl: true });
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
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      const res = response.data;
      this.handleTokenRefreshSuccess(res);
    } catch (error) {
      console.error("Error refreshing access token:", error);
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  private handleTokenRefreshSuccess(res: any) {
    const newAccessToken = res.accessToken;
    const expiresIn = res.expiresIn;
    const expiresAt = moment().add(expiresIn, 'seconds');
    this.tokenService.set("accessToken", newAccessToken);
    this.tokenService.set('expiresIn', expiresAt.unix());
    console.log("Access token refreshed successfully.");
  }

  async isUserAuthenticated(): Promise<boolean> {
    try {
      const token = await this.tokenService.get("accessToken");
      if (!token) {
        this.isAuthenticated.next(false);
        console.log("User not authenticated: Token not found.");
        return false;
      }
      const expiresIn = await this.tokenService.get("expiresIn");
      const isExpired = this.isTokenExpired(expiresIn);
      console.log("expired: " , isExpired)
      if (isExpired) {
        this.isAuthenticated.next(false);
        console.log("User not authenticated: Token is expired.");
        return false;
      }
      this.isAuthenticated.next(true);
      console.log("User is authenticated.");
      return true;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      throw error;
    }
  }

  async isAdmin(): Promise<boolean> {
    try {
      if (await this.isUserAuthenticated()) {
        const role = await this.tokenService.get("role");
        return role === 'STAR';
      } else {
        console.log("User not authenticated.");
        return false;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    this.isAuthenticated.next(false);
    const tokensToRemove = ["accessToken", "expiresIn", "role", "username"];
    await Promise.all(tokensToRemove.map(token => this.tokenService.remove(token)));
    await this.tokenService.clean();
    console.log("User signed out successfully.");
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private isTokenExpired(expiresIn: any): boolean {
    try {
      const expirationTimeInSeconds = parseInt(expiresIn, 10);
      const expirationTime = moment.unix(expirationTimeInSeconds);
      const currentTime = moment();
      const isTokenExpired = currentTime.isAfter(expirationTime);
      console.log("Current Time:", currentTime.format()); // Format for better readability
      console.log("Expiration Time:", expirationTime.format());
      console.log("Is token expired:", isTokenExpired);
      return isTokenExpired; // Return true if the token is not expired
    } catch (error) {
      console.error('Error checking token expiration:', error);
      // Consider logging or handling the error appropriately
      return true;
    }
  }
  
  
}
