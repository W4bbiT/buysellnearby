import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/productModel';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css'],
})
export class EditProductComponent implements OnInit {
  product: Product
  id: string
  productForm: FormGroup

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    //gettig a product from the url id
    this.id = this.route.snapshot.paramMap.get('pId');
    this.productService.getOneProduct(this.id)
      .subscribe(product => {
        this.product = product;
      });
    this.productForm = this.formBuilder.group({
      productName: new FormControl(),
      category: new FormControl(),
      price: new FormControl(),
      discount: new FormControl(),
      description: new FormControl(),
      productImage: new FormControl(),
      inStock: new FormControl(),
      featureProduct: new FormControl(),
      details: new FormControl(),
    })
  }
  
  editProduct() {
    this.productService.editProduct(this.id, this.productForm.value)
      .subscribe({
        next: (res) => {
          alert("Product edited successfully")
          this.router.navigateByUrl('/products')
        },
        error: () => {
          alert("Check whats missing!")
        }
      })
  }
}
