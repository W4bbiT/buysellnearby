import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, InfiniteScrollCustomEvent, IonList, IonItem, IonSkeletonText, IonAvatar, IonAlert, IonLabel, IonCard, IonCardContent, IonCardSubtitle, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { ProductsService } from '../../../services/products.service';
import { catchError, finalize } from 'rxjs';
import { Product } from '../../../models/product';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonSkeletonText, 
    IonAvatar, IonAlert, IonLabel, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, 
    IonCardTitle, IonGrid, IonRow, IonCol, CurrencyPipe, RouterModule, IonBadge, IonInfiniteScroll, 
    IonInfiniteScrollContent],
})
export class HomePage {
  private productService = inject(ProductsService);
  private userService = inject(UsersService)
  private authService = inject(AuthService)

  private currentPage = 1;
  public error = null;
  public isLoading = false;
  public products: Product[] = [];
  public dummyArray = new Array(5);
  public isLoggedIn = false


  constructor() {
    this.loadProducts();
  }

  loadProducts(event?: InfiniteScrollCustomEvent) {
    this.error = null;
    if (!event) {
      this.isLoading = true;
    }
    console.log(this.authService.isAuthenticated.value);
    if (this.authService.isAuthenticated.value === false) {

      this.productService.getAllProducts().pipe(
        finalize(() => {
          this.isLoading = false;
          if (event) {
            event.target.complete();
          }
        }),
        catchError((err: any) => {
          this.handleError(err);
          return [];
        })
      ).subscribe({
        next: (res) => {
          console.log(res);
          // Check if 'res' has 'products' property
          this.products = res.products;
          console.log(this.products[0].productImages[0].path);
          if (event) {
            event.target.disabled = true;
          }
        }
      });

    } else {

      this.userService.findNearbyProducts().pipe(
        finalize(() => {
          this.isLoading = false;
          if (event) {
            event.target.complete();
          }
        }),
        catchError((err: any) => {
          this.handleError(err);
          return [];
        })
      ).subscribe({
        next: (res) => {
          console.log(res);
          this.products = res;
          if (event) {
            event.target.disabled = true;
          }
        }
      });
    }
  }
  

  private handleError(error: any) {
    this.error = error?.error?.status_message || 'An unexpected error occurred.';
    // You can add additional logic here to handle the error as needed
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    this.currentPage++;
    this.loadProducts(event);
  }
}
