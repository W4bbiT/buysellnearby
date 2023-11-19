import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  @Input() selectedCategory: string[] = ['/'];
  @Output() categoryChange = new EventEmitter<string[]>();

  onCategory(category: string[]): void {
    this.categoryChange.emit(category);
  }

  isSelectedCategory(categories: string[]): boolean {
    return categories.every(category => this.selectedCategory.includes(category));
  }
}
