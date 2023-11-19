import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/services/products.service';
import { Plugin } from '@egjs/ngx-flicking';
import { Perspective } from '@egjs/flicking-plugins';
import { AutoPlay } from "@egjs/flicking-plugins";

@Component({
  selector: 'app-top-product',
  templateUrl: './top-product.component.html',
  styleUrls: ['./top-product.component.css']
})
export class TopProductComponent implements OnInit  {
  topProducts: any

  constructor(
    private productService: ProductsService,
    private router: Router
  ){  }

  ngOnInit():void{
    this.productService.getTopProducts().subscribe({
      next:(data)=>{
        this.topProducts = data
        console.log(data)
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }

  public plugins: Plugin[] = [new Perspective({ rotate: 0.1 }),new AutoPlay({ duration: 5000, direction: "NEXT", stopOnHover: false })];

  goToProductPage(productId: string): void {
    this.router.navigateByUrl("/products/" + productId)
  }

}
