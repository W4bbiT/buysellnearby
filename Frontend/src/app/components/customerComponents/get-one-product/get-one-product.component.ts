import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/productModel';
import { User } from 'src/app/models/userModel';
import { ProductsService } from 'src/app/services/products.service';
import { UsersService } from 'src/app/services/users.service';
import { Plugin } from "@egjs/ngx-flicking";
import { Arrow } from "@egjs/flicking-plugins";

@Component({
  selector: 'app-get-one-product',
  templateUrl: './get-one-product.component.html',
  styleUrls: ['./get-one-product.component.css'],
})
export class GetOneProductComponent implements OnInit {

  product: Product;
  pId: string;
  reviews: any;
  page: number = 1;
  limit: number = 10;
  avgRate: number = 0;
  user: User;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsService,
    private userService: UsersService
  ) { }

  ngOnInit(): void {
    this.pId = this.route.snapshot.paramMap.get('pId');
    if (this.pId) {
      this.getProduct();
      this.getReviews();
    } else {
      console.error('Product ID is undefined.');
    }
  }

  public plugins: Plugin[] = [new Arrow()];
  getProduct(): void {
    if (this.pId) {
      this.productService.getOneProduct(this.pId).subscribe({
        next: (res) => {
          if (res) {
            this.product = res.data;          }
        },
        error: (err) => {
          console.error('Error getting product:', err);
        },
      });
    }
  }
  getReviews(): void {
    if (this.pId) {
      this.productService.getProductReviews(this.pId, this.page, this.limit)
        .subscribe({
          next: (res) => {
            this.reviews = res;
            this.avgRate = (res?.averageRating / 5) * 100;
          },
          error: (err) => {
            console.error('Error getting reviews:', err);
          }
        });
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.getReviews();
    }
  }

  nextPage(): void {
    // Assuming you have the total number of reviews available
    const totalReviews = this.reviews.totalCount;
    const totalPages = Math.ceil(totalReviews / this.limit);

    if (this.page < totalPages) {
      this.page++;
      this.getReviews();
    }
  }

  // Helper function to convert rating to star icons
  getStarRating(rating: number): string {
    const filledStar = '★';
    const emptyStar = '☆';
    const maxRating = 5;
    const roundedRating = Math.round(rating);

    return filledStar.repeat(roundedRating) + emptyStar.repeat(maxRating - roundedRating);
  }
}
