import { Component } from '@angular/core';
import { Cart } from 'src/app/models/cartModel';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  title = 'Azar&Co';
  cart: Cart;
  totalQuantity: number = 0;
  loggedIn: boolean
  constructor(
    private userService: UsersService,
    private tokenStorage: TokenStorageService) {}

  ngOnInit(): void {
    this.userService.getCartForUser().subscribe((data) => {
      this.cart = data;
      for (let i = 0; i < this.cart.products.length; i++) {
        this.totalQuantity += this.cart.products[i].quantity;
      }
    });
    this.loggedIn = this.tokenStorage.isLoggedIn()
  }
}
