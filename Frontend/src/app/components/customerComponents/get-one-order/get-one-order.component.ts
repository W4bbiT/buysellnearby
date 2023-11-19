import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from 'src/app/models/orderModel';
import { Review } from 'src/app/models/reviewModel';
import { ProductsService } from 'src/app/services/products.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-get-one-order',
  templateUrl: './get-one-order.component.html',
  styleUrls: ['./get-one-order.component.css'],
})
export class GetOneOrderComponent implements OnInit {
  order: Order;
  id: string;
  review: string;
  reviewForm: FormGroup;
  isReviewModalOpened: boolean = false;
  pId: string
  rating: number;


  constructor(
    private userService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    const oId = this.route.snapshot.paramMap.get('oId');
    this.userService.getOneOrder(oId).subscribe({
      next: (res) => {
        if (res) {
          this.order = res;
          console.log(res);
        }
      },
      error: (err) => {
        if (err.status === 401) {
          alert('No products found!');
        }
        console.log(err);
      },
    });
    this.reviewForm = this.formBuilder.group({
      rating: new FormControl(),
      review: new FormControl()
    });
  }
  setRating(rating: number): void {
    this.rating = rating;
  }

  openToReview(pId: string): void {
    this.pId = pId
    this.isReviewModalOpened = !this.isReviewModalOpened;
  }

  addReview() {
    this.reviewForm.patchValue({ 
      rating: this.rating
    });
    this.userService.addReview(this.pId, this.reviewForm.value).subscribe({
      next: () => {
        alert("Successfully added the review")
      },
      error: (err) => {
        alert("Somethng went wrong!")
      },
    });
    this.router.navigateByUrl('/products/' + this.pId)
  
  }

  clickedOutside(): void {
    this.isReviewModalOpened = false;
  }
}
