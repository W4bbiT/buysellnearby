import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from 'src/app/models/orderModel';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-get-all-order',
  templateUrl: './get-all-order.component.html',
  styleUrls: ['./get-all-order.component.css'],
})
export class GetAllOrderComponent implements OnInit {
  orders: Order[]
  constructor(private userService: UsersService,
    private route: Router) { }

  ngOnInit(): void {
    this.userService.getOrderForThisUser().subscribe({
      next: (orders) => {
        this.orders = orders
      },
      error: () => {
        alert('There was an error please contact support')
      }
    })
  }

  goToThisOrder(oId: string): void {
    this.route.navigateByUrl("/orders/" + oId)
  }
}
