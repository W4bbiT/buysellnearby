import { Routes } from '@angular/router';
import { LoggedInGuard } from './guards/logged-in.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/sign-in/sign-in.page').then( m => m.SignInPage),
    canActivate: [LoggedInGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/sign-up/sign-up.page').then( m => m.SignUpPage),
    canActivate: [LoggedInGuard]
  },
  {
    path: 'details/:productId',
    loadComponent: () => import('./pages/product-details/product-details.page').then( m => m.ProductDetailsPage)
  },
  {
    path: 'chat/:userId',
    loadComponent: () => import('./pages/chats/chats.page').then( m => m.ChatsPage),
    canActivate: [AuthGuard]
  },

  {
    path: 'edit-profile',
    loadComponent: () => import('./pages/edit-profile/edit-profile.page').then( m => m.EditProfilePage),
    canActivate: [AuthGuard]
  },

  {
    path: 'edit-product/:productId',
    loadComponent: () => import('./pages/edit-product/edit-product.page').then( m => m.EditProductPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.routes').then( m => m.routes)
  },
];
