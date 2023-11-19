import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/productModel';

@Injectable({
  providedIn: 'root'
})
export class SearchDataService {
  
  private dataRecieved = new BehaviorSubject<any>('')
  currentData =  this.dataRecieved.asObservable()

  constructor() { }

  changeData(data: Product[]){
    
    this.dataRecieved.next(data)
  }
}
