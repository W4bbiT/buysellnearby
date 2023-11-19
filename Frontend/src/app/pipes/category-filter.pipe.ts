import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../models/productModel';

@Pipe({
  name: 'categoryFilter'
})
export class CategoryFilterPipe implements PipeTransform {
  transform(products: Product[], selectedCategories: string[]): Product[] {
    if (!products || !selectedCategories || selectedCategories.length === 0) {
      return products; // If no products or categories selected, return the original array
    }

    // Filter the products based on the selected categories
    return products.filter(product => selectedCategories.includes(product.category));
  }
}
