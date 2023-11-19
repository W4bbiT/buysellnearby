import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { inject } from '@angular/core';

export const LoggedInAuthGuard = () => {
  const router = inject(Router)
  const tokenStorage = inject(TokenStorageService)
    if (!tokenStorage.isLoggedIn()) {
      return true     
    } else {
      router.navigate(['/profile'])
      return false
    }
}
