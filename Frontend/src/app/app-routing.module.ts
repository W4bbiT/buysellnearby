import { Component, NgModule } from '@angular/core';
import { CreateProductComponent } from './components/adminComponents/create-product/create-product.component';
import { CreateUserComponent } from './components/customerComponents/create-user/create-user.component';
import { EditProductComponent } from './components/adminComponents/edit-product/edit-product.component';
import { EditUserComponent } from './components/customerComponents/edit-user/edit-user.component';
import { GetAllProductComponent } from './components/adminComponents/get-all-product/get-all-product.component';
import { GetAllUserComponent } from './components/adminComponents/get-all-user/get-all-user.component';
import { GetOneProductComponent } from './components/customerComponents/get-one-product/get-one-product.component';
import { HomePageComponent } from './components/customerComponents/home-page/home-page.component';
import { LoginComponent } from './components/customerComponents/login/login.component';
import { ProfileComponent } from './components/customerComponents/profile/profile.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { LoggedInAuthGuard } from './guards/logged-in-auth.guard';
import { Routes, RouterModule } from '@angular/router';
import { SearchResultComponent } from './components/customerComponents/search-result/search-result.component';
const routes: Routes = [
  //homepage
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  { path: 'search-results', component: SearchResultComponent}, 
  //users
  { path: 'signin', component: LoginComponent, canActivate:[LoggedInAuthGuard]},
  { path: 'signup', component: CreateUserComponent, canActivate:[LoggedInAuthGuard]},
  { path: 'profile', component: ProfileComponent, canActivate:[AuthGuard]},
  { path: 'edit', component: EditUserComponent, canActivate:[AuthGuard] },
  { path: 'products', component: GetAllProductComponent, canActivate:[AuthGuard]},
  { path: 'products/:pId', component: GetOneProductComponent},
  
  //paths for Admin
  { path: 'users', component: GetAllUserComponent, canActivate:[AdminAuthGuard] },
  { path: 'products/:pId/edit', component: EditProductComponent, canActivate:[AdminAuthGuard] },
  { path: 'addproduct', component: CreateProductComponent, canActivate:[AdminAuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
