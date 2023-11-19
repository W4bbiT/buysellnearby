import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/services/products.service';
import { Plugin } from "@egjs/ngx-flicking";
import { AutoPlay } from "@egjs/flicking-plugins";
@Component({
  selector: 'app-feature-product',
  templateUrl: './feature-product.component.html',
  styleUrls: ['./feature-product.component.css'],
})
export class FeatureProductComponent implements OnInit {
  products: any
  constructor(
    private productService: ProductsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.productService.getFeaturedProduct().subscribe({
      next: (data) => {
        this.products = data
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  plugins: Plugin[] = [new AutoPlay({ duration: 10000, direction: "NEXT", stopOnHover: true })];

  goToProductPage(productId: string): void {
    this.router.navigateByUrl("/products/" + productId)
  }
}
