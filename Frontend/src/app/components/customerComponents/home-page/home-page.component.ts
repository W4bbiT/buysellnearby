import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/productModel';
import { ProductsService } from 'src/app/services/products.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  products: Product[];
  currentPage: number = 1;
  limit: number = 50;
  totalPages: number;
  selectedCategory: string[] = ['/']; 

  constructor(
    private userService: UsersService,
    private productService: ProductsService,
  ) { }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    if (this.selectedCategory.length > 0 && !this.selectedCategory.includes('/')) {
      this.productService.searchCategory(this.selectedCategory, this.currentPage, this.limit)
        .subscribe({
          next: (products: Product[]) => {
            this.products = products;
            // You might need to update totalPages based on the response from the API
          },
          error: () => {
            alert("No products found for the selected category!");
          }
        });
    } else {
      this.productService.getAllProducts(this.currentPage, this.limit)
        .subscribe({
          next: (response: any) => {
            this.products = response.products;
            this.totalPages = response.totalPages;
          },
          error: () => {
            alert("No products found!");
          }
        });
    }
  }

  onCategory(categories: string[]){
    this.selectedCategory = categories; // Set the selected category
    this.fetchProducts(); // Fetch products for the selected category
  }

  isSelectedCategory(categories: string[]): boolean {
    return categories.every(category => this.selectedCategory.includes(category));
  }
  

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchProducts();
    }
  }
}
