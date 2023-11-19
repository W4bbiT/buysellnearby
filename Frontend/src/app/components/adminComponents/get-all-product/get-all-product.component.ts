import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { Product } from 'src/app/models/productModel';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';
import { Cart } from 'src/app/models/cartModel';

@Component({
  selector: 'app-get-all-product',
  templateUrl: './get-all-product.component.html',
  styleUrls: ['./get-all-product.component.css'],
})
export class GetAllProductComponent implements OnInit {

  products: Product[];
  cart: Cart;
  page:number=1;
  limit:number=10;

  constructor(
    private productService: ProductsService,
    private userService: UsersService,
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

  addToCart(productId: string){
    this.userService.addProductToMyCart(productId, this.cart)
    .subscribe(
      {
        next: (res)=>{
          alert("Product add to cart successfully")
        },
        error: ()=>{
          alert("Product not added to your cart because it already exist")
        }
      }
    )
  }
}
