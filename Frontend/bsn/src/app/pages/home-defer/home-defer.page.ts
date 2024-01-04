import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, InfiniteScrollCustomEvent, IonList, IonItem, IonSkeletonText, IonAvatar, IonAlert, IonLabel, IonCard, IonCardContent, IonCardSubtitle, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { ProductsService } from '../../services/products.service';
import { catchError, finalize } from 'rxjs';
import { Product } from '../../models/product';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-defer',
  templateUrl: './home-defer.page.html',
  styleUrls: ['./home-defer.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonSkeletonText, IonAvatar, IonAlert, IonLabel, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol,
    CurrencyPipe, RouterModule, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent]
})
export class HomeDeferPage{
  private productService = inject(ProductsService)
  private currentPage = 1;
  public error = null;
  public isLoading = false;
  public products: Product[] = [];
  public imageBaseURL = 'http://localhost:3000/';
  public dummyArray = new Array(5);

  constructor() {
    this.loadProducts();
  }

  loadProducts(event?: InfiniteScrollCustomEvent) {
    this.error = null;
    if (!event) {
      this.isLoading = true;
    }
    this.productService.getAllProducts().pipe(
      finalize(() => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }),
      catchError((err: any) => {
        console.log(err);
        this.error = err.error.status_message;
        return [];
      })
    ).subscribe({
      next: (res) => {
        console.log(res);
        this.products = res.products;
        if (event) {
          event.target.disabled = true;
        }
      }
    })
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    this.currentPage++;
    this.loadProducts(event);
  }
}
