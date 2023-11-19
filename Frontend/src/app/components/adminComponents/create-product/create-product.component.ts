import { Component, OnInit} from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
})
export class CreateProductComponent implements OnInit {
  productForm !: FormGroup

  constructor(
    private productService: ProductsService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      productName: ['', Validators.required],
      categories: [[]], // Initialize as an empty array
      price: ['', Validators.required],
      discount: ['', Validators.required],
      description: ['', Validators.required],
      productImage: ['', Validators.required],
      inStock: ['', Validators.required],
      featureProduct: ['', Validators.required],
      details: ['', Validators.required]
    })
  }

  addProduct(){
    if(this.productForm.valid){
      this.productService.createProduct(this.productForm.value)
      .subscribe({
        next:(res) => {
          alert("Product added successfully")
          this.productForm.reset()
        },
        error:()=>{
          alert("Check whats missing!")
        }
      })
    }
  }

}