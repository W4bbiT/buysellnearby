import { Component, OnInit } from '@angular/core';
import { Cart } from 'src/app/models/cartModel';
import { User } from 'src/app/models/userModel';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-get-all-cart',
  templateUrl: './get-all-cart.component.html',
  styleUrls: ['./get-all-cart.component.css'],
})
export class GetAllCartComponent implements OnInit {
  cart: Cart;
  user: User;
  id: string;
  error: string;

  constructor(private userService: UsersService) { }

  ngOnInit(): void {
    this.userService.getCartForUser().subscribe({
      next: (data) => {
        this.cart = data;
      },
      error: (error) => {
        console.error('Error retrieving cart data:', error);
        this.error = 'Error retrieving cart data. Please try again later.';
      }
    });
  }

  emptyTheCart(): void {
    this.userService.emptyCart().subscribe({
      next: (res) => {
        alert('Empty Cart');
        location.reload();
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error. Please try again.');
      },
    });
  }


  updateQuantity(pId: string): void {
    this.userService.updateCart(pId, this.cart).subscribe({
      next: (res) => {
        alert('Update Success');
        this.refreshCart();
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        alert('Error updating quantity. Please try again.');
      },
    });
  }

  pullProduct(pId: string): void {
    this.userService.pullProductFromCart(pId).subscribe({
      next: (res) => {
        alert('Product deleted from cart successfully');
        this.refreshCart();
      },
      error: (error) => {
        console.error('Error deleting product from cart:', error);
        alert('Product not found or an error occurred. Please try again.');
      },
    });
  }


  checkingOut(): void {
    this.userService.checkoutCart().subscribe({
      next: (res) => {
        alert('Order placed successfully');
        this.refreshCart();
      },
      error: (error) => {
        console.error('Error placing order:', error);
        alert("Can't place the order for some reason! Please contact support.");
      },
    });
  }

  private refreshCart(): void {
    this.userService.getCartForUser().subscribe({
      next: (data) => {
        this.cart = data;
      },
      error:
        (error) => {
          console.error('Error refreshing cart data:', error);
          this.error = 'Error refreshing cart data. Please try again later.';
        }
    });
  }
}
