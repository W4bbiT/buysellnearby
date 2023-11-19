import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/services/products.service';
@Component({
  selector: 'app-hero-page',
  templateUrl: './hero-page.component.html',
  styleUrls: ['./hero-page.component.css']
})
export class HeroPageComponent implements OnInit{
  reviews: any

  constructor(
      private productService: ProductsService,
      private router: Router
    ){

  }

  ngOnInit(): void {
    this.productService.getTopReviews().subscribe({
      next: (data) => {
        this.reviews = data
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  shopNow() {
    this.router.navigate(['/home/']);
  }
}
