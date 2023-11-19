import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Product } from 'src/app/models/productModel';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-search-product',
  templateUrl: './search-product.component.html',
  styleUrls: ['./search-product.component.css'],
})
export class SearchProductComponent {
  searchTerm: FormControl = new FormControl();
  searchResults: Product[];
  loading: boolean;
  error: string;
  isSearchResultsOpened: boolean = false;

  constructor(private productService: ProductsService) { }

  ngOnInit(): void {
    this.searchTerm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.searchProducts();
    });
  }

  searchProducts(): void {
    this.isSearchResultsOpened = false;
    if (this.searchTerm.value) {
      this.loading = true;
      this.error = '';

      this.productService.searchProduct(this.searchTerm.value)
        .subscribe({
          next: (products: Product[]) => {
            this.searchResults = products;
            this.loading = false;
            this.isSearchResultsOpened = true;
          },
          error: (error: any) => {
            console.error('Error occurred while searching for products:', error);
            this.error = 'An error occurred while searching for products.';
            this.loading = false;
          }
        });
    } else {
      this.searchResults = [];
    }
  }

  clickedOutside(): void {
    this.isSearchResultsOpened = false;
  }
}
