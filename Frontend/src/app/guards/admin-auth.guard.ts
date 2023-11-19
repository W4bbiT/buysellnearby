import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { Router } from '@angular/router';

export const AdminAuthGuard = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  if (tokenStorage.isAdmin()) {
    return true;
  } else {
    alert('You are not Authorized to access this page');
    router.navigate(['/signin']);
    return false;
  }
};
