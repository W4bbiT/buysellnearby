import { Routes } from '@angular/router';
import { LoggedInGuard } from './guards/logged-in.guard';
import { AuthGuard } from './guards/auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
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
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'product-list',
    loadComponent: () => import('./pages/product-list/product-list.page').then( m => m.ProductListPage),
    
  },
  {
    path: 'header',
    loadComponent: () => import('./pages/header/header.page').then( m => m.HeaderPage),
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'footer',
    loadComponent: () => import('./pages/footer/footer.page').then( m => m.FooterPage),

  },
  {
    path: 'details/:productId',
    loadComponent: () => import('./pages/product-details/product-details.page').then( m => m.ProductDetailsPage)
  },
  {
    path: 'chats',
    loadComponent: () => import('./pages/chats/chats.page').then( m => m.ChatsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'chat/:userId',
    loadComponent: () => import('./pages/chat-list/chat-list.page').then( m => m.ChatListPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./pages/edit-profile/edit-profile.page').then( m => m.EditProfilePage)
  },
  {
    path: 'add-product',
    loadComponent: () => import('./pages/add-product/add-product.page').then( m => m.AddProductPage)
  },
  {
    path: 'edit-product',
    loadComponent: () => import('./pages/edit-product/edit-product.page').then( m => m.EditProductPage)
  },
];
