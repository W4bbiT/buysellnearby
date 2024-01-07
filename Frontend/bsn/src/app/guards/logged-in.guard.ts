import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, from, mergeMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LoggedInGuard {
  constructor(private authService: AuthService,
    private router: Router){
  }
  canActivate(): Observable<boolean> {
    return from(this.authService.isUserAuthenticated())
      .pipe(mergeMap(isAuthenticated => {
        return new Observable<boolean>(observer => {
          if (isAuthenticated) this.router.navigateByUrl('/profile')
          observer.next(!isAuthenticated)
        })
      }))
  }
};