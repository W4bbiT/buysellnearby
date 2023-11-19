import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { Router } from '@angular/router';

export const AuthGuard = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  if (tokenStorage.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/signin']);
    return false;
  }
};
