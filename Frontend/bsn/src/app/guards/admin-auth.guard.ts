import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, from, map, mergeMap } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AdminAuthGuard {
  constructor(private authService: AuthService,
    private router: Router){
  }
  canActivate(): Observable<boolean> {
    return from(this.authService.isAdmin())
      .pipe(
        map(isAdmin => {
          if (!isAdmin) {
            this.router.navigateByUrl('/sign-in');
          }
          return isAdmin;
        }))
      }
};
