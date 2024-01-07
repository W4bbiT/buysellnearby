import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, from, mergeMap } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard {
  constructor(private authService: AuthService,
    private router: Router){
  }
  canActivate(): Observable<boolean> {
    return from(this.authService.isUserAuthenticated())
      .pipe(mergeMap(isAuthenticated => {
        return new Observable<boolean>(observer => {
          if (!isAuthenticated) this.router.navigateByUrl('/sign-in')
          observer.next(isAuthenticated)
        })
      }))
  }
};