import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { Product } from 'src/app/models/productModel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-all-product',
  templateUrl: './get-all-product.component.html',
  styleUrls: ['./get-all-product.component.css'],
})
export class GetAllProductComponent implements OnInit {

  products: Product[];
  page:number=1;
  limit:number=10;

  constructor(
    private productService: ProductsService,
    private route: Router,
  ) { }

  ngOnInit(): void {
    this.productService.getAllProducts(this.page, this.limit)
      .subscribe(
        {
          next:(products)=>{
            this.products = products
          },
          error:()=>{
            alert("No products found!")
          }
        }
      );
  }

  goToProduct(productId: string) {
    this.route.navigateByUrl("/products/" + productId)
  }

  deleteProduct(productId: string){
    this.productService.deleteProduct(productId)
    .subscribe(
      {
        next: (res)=>{
          alert("Product deleted successfully")
        },
        error: ()=>{
          alert("Product not found")
        }
      }
    )
  }
}
