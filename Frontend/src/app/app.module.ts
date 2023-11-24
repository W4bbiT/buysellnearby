import { NgModule } from '@angular/core';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateProductComponent } from './components/adminComponents/create-product/create-product.component';
import { EditProductComponent } from './components/adminComponents/edit-product/edit-product.component';
import { GetAllProductComponent } from './components/adminComponents/get-all-product/get-all-product.component';
import { GetOneProductComponent } from './components/customerComponents/get-one-product/get-one-product.component';
import { CreateUserComponent } from './components/customerComponents/create-user/create-user.component';
import { GetAllUserComponent } from './components/adminComponents/get-all-user/get-all-user.component';
import { EditUserComponent } from './components/customerComponents/edit-user/edit-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HomePageComponent } from './components/customerComponents/home-page/home-page.component';
import { LoginComponent } from './components/customerComponents/login/login.component';
import { ProfileComponent } from './components/customerComponents/profile/profile.component';

import { HttpRequestInterceptor } from './helper/auth.interceptor';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { ProductsService } from './services/products.service';
import { ProfileMenuComponent } from './components/menus/profile-menu/profile-menu.component';
import { LoginMenuComponent } from './components/menus/login-menu/login-menu.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { BrowserModule } from '@angular/platform-browser';
import { SearchProductComponent } from './components/search-product/search-product.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FeatureProductComponent } from './components/customerComponents/feature-product/feature-product.component';
import { TopProductComponent } from './components/customerComponents/top-product/top-product.component';
import { SearchResultComponent } from './components/customerComponents/search-result/search-result.component';
import { CategoryFilterPipe } from './pipes/category-filter.pipe';
import { NgxFlickingModule } from '@egjs/ngx-flicking';
import { SideBarComponent } from './components/customerComponents/side-bar/side-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateProductComponent,
    EditProductComponent,
    GetAllProductComponent,
    GetOneProductComponent,
    CreateUserComponent,
    GetAllUserComponent,
    EditUserComponent,
    HomePageComponent,
    LoginComponent,
    ProfileComponent,
    ProfileMenuComponent,
    LoginMenuComponent,
    ClickOutsideDirective,
    SearchProductComponent,
    HeaderComponent,
    FooterComponent,
    FeatureProductComponent,
    TopProductComponent,
    SearchResultComponent,
    CategoryFilterPipe,
    SideBarComponent
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxFlickingModule
  ],
  providers: [AuthService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpRequestInterceptor,
    multi:true
  },
  UsersService,
  ProductsService
],
  bootstrap: [AppComponent],
  schemas: []
})
export class AppModule { }
