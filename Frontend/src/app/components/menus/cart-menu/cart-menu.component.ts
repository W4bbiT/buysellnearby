import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart-menu',
  templateUrl: './cart-menu.component.html',
  styleUrls: ['./cart-menu.component.css'],
})
export class CartMenuComponent implements OnInit {
  @Input() quantity: string
  isMenuOpened: boolean = false
  constructor() { }
  ngOnInit(): void {
  }
  toggleMenu(): void {
    this.isMenuOpened = !this.isMenuOpened;
  }
  clickedOutside(): void {
    this.isMenuOpened = false;
  }
}
