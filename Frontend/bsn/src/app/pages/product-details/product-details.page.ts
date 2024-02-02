import {
  Component, inject, Input, signal, WritableSignal, AfterViewInit,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ProductsService } from 'src/app/services/products.service';
import { Product } from 'src/app/models/product';
import { register } from 'swiper/element/bundle'
import { Swiper } from 'swiper'
import { UsersService } from 'src/app/services/users.service';
import { UserApi } from 'src/app/models/user';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProductDetailsPage implements AfterViewInit {
  private productService = inject(ProductsService);
  public product: WritableSignal<Product | null> = signal(null);
  @ViewChild("swiperEx") swiperEx?: ElementRef<{ swiper: Swiper }>;
  public isLoading: boolean = true;
  error = '';
  private userService = inject(UsersService)
  private wsService = inject(WebSocketService)
  private router = inject(Router)
  public navCtrl = inject(NavController)
  @Input()
  set productId(productId: string) {
    this.productService.getProductDetails(productId).subscribe((res) => {
      console.log(res);
      this.product.set(res.product);
    })
  }

  ngAfterViewInit(): void {
    register(); //swiper
  }

  constructor() { }

  onSlideChange() {
    console.log(this.swiperEx?.nativeElement.swiper.activeIndex);
  }

  joinChat(receiver: string) {
    try {
      this.wsService.sendMessage({ recipient: receiver, message: '' });
      this.router.navigate(['/chat', receiver]);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  }
}
