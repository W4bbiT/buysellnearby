import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay, from, map, switchMap, throwError } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { NavController } from '@ionic/angular/standalone';


@Injectable({
  providedIn: 'root'
})

export class UsersService {
  private BASE_URL = 'http://localhost:3000/api/user';
  private tokenService = inject(TokenStorageService);
  private http = inject(HttpClient)
  private navCtrl = inject(NavController)
  async getProfile(): Promise<any> {
    try {
      const token = await this.tokenService.get("accessToken");
      if (!token) {
        console.log("User not authenticated: Token not found.");
        return null;
      }
      const options = {
        url: `${this.BASE_URL}/profile`,
        headers: { 'Authorization': token },
      };
      const response: HttpResponse = await CapacitorHttp.get(options);
      const profileData = response.data;
      if (profileData) {
        console.log("User profile fetched successfully:", profileData);
        return profileData;
      } else {
        console.log("Error fetching user profile:", response);
        return null;
      }
    } catch (error) {
      console.error("An error occurred during profile fetch:", error);
      return null;
    }
  }

  updateProfile(updatedUser: any): Observable<any> {
    const url = `${this.BASE_URL}/update-user`;
    return this.http.patch<any>(url, updatedUser).pipe(
      catchError((error) => {
        console.error('Error editing profile:', error);
        throw error;
      }),
      delay(500),
    );
  }

  findNearbyProducts(radius?: number): Observable<any> {
    const url = radius ? `${this.BASE_URL}/nearby?radius=${radius}` : `${this.BASE_URL}/nearby`;
    return from(this.tokenService.get("accessToken")).pipe(
      map(token => ({
        url,
        headers: { 'Authorization': token },
      })),
      catchError(this.handleError),
      switchMap(options =>
        from(CapacitorHttp.get(options)).pipe(
          map(response => response.data),
          catchError(this.handleError)
        )
      )
    );
  }

 async sendChatMessage(userId: string, sentTo:string,  message: string): Promise<any> {
    try {
      const token = await this.tokenService.get('accessToken');
      const options = {
        url: `${this.BASE_URL}/chat/send`,
        headers: { 'Authorization': token },
        data: { userId, sentTo, message }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      return response.data;
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  }

  async getAllChatMessages(): Promise<any> {
    try {
      const token = await this.tokenService.get('accessToken');
      const options = {
        url: `${this.BASE_URL}/chat/all`,
        headers: { 'Authorization': token },
      };
      const response: HttpResponse = await CapacitorHttp.get(options);
      return response.data;
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  }

  async getChatMessagesForProduct(productId: string): Promise<any> {
    try {
      const token = await this.tokenService.get('accessToken');
      const options = {
        url: `${this.BASE_URL}/chat/product/${productId}`,
        headers: { 'Authorization': token },
      };
      const response: HttpResponse = await CapacitorHttp.get(options);
      return response.data;
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  }

  setUpChat(productName: string, receiverId: string, ownerId: string): void {
    this.navCtrl.navigateForward(['/chat', {
      productName,
      receiverId,
      ownerId
    }]);
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
