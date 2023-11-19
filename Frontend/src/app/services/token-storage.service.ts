import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() { }

  public setLocalStorage(responseObj: any) {
    const expiresAt = moment().add(moment.duration(responseObj.expiresIn).asSeconds(), 'seconds');

    localStorage.setItem('accessToken', responseObj.accessToken);
    localStorage.setItem('expiresIn', JSON.stringify(expiresAt.valueOf()));
    localStorage.setItem('role', responseObj.role);
    console.log('expiresIn', JSON.stringify(expiresAt.valueOf()));
    console.log(responseObj.expiresIn);
  }

  public logout(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('expiresIn')
    localStorage.removeItem('role')
  }

  public isLoggedIn(): boolean {
    const authToken = localStorage.getItem('accessToken');
    const expiresIn = localStorage.getItem('expiresIn');

    if (authToken && expiresIn) {
      const expirationTimeInSeconds = parseInt(expiresIn) / 1000; // Convert milliseconds to seconds
      const expirationTime = moment.unix(expirationTimeInSeconds);
      const currentTime = moment();
      const isTokenValid = expirationTime.isAfter(currentTime);

      console.log('Expiration Time:', expirationTime);
      console.log('Current Time:', currentTime);
      console.log('Is Token Valid:', isTokenValid);

      return isTokenValid;
    }
    return false
  }

  public isAdmin(): boolean {
    if (this.isLoggedIn()) { // <-- Add parentheses to call the method
      if (localStorage.getItem('role') === 'STAR') {
        return true;
      }
      return false;
    }
    return false;
  }



}

