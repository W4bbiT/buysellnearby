import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

const BASE_URL = ''

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private http = inject(HttpClient)

  constructor() { }

  getAllProducts(page = 1){
  }

  getProductsNearby(){

  }

}
