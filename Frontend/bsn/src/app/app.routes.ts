import { Routes } from '@angular/router';

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
    path: 'home-defer',
    loadComponent: () => import('./pages/home-defer/home-defer.page').then( m => m.HomeDeferPage)
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in.page').then( m => m.SignInPage)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up.page').then( m => m.SignUpPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'product-list',
    loadComponent: () => import('./pages/product-list/product-list.page').then( m => m.ProductListPage)
  },
  {
    path: 'header',
    loadComponent: () => import('./pages/header/header.page').then( m => m.HeaderPage)
  },
  {
    path: 'footer',
    loadComponent: () => import('./pages/footer/footer.page').then( m => m.FooterPage)
  },
  {
    path: 'details/:pId',
    loadComponent: () => import('./pages/product-details/product-details.page').then( m => m.ProductDetailsPage)
  },
];
