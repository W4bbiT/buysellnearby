import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UsersService } from 'src/app/services/users.service';
import { Chat } from 'src/app/models/chat';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChatsPage implements OnInit {

  private userService = inject(UsersService);
  allChat: Chat[] = [];

  message: {
    sender: string;
    message: string;
  } = { sender: '', message: '' };

  productName: string = '';
  receiverId: string = '';
  productId: string = '';
  ownerId: string = '';

  isLoading: boolean = false;
  error: string | null = null;
  public route = inject(ActivatedRoute);
  constructor() { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productName = params['productName'];
      this.receiverId = params['receiverId'];
      this.productId = params['productId'];
      this.ownerId = params['ownerId'];
    });
  }

  async sendMessage(userId: string, sentTo: string, message: string) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.userService.sendChatMessage(userId, sentTo, message);
      console.log('Message sent successfully:', response);
      // Provide valid values for product and timestamp
      const newChat: Chat = {
        sender: userId,
        receiver: sentTo,
        message,
        timestamp: new Date(),
        ownerId: this.ownerId,
        product: this.productId
      };
      this.allChat.push(newChat);
    } catch (error) {
      console.error('Error message:', error);
      this.error = 'Failed.';
    } finally {
      this.isLoading = false;
    }
  }

}
