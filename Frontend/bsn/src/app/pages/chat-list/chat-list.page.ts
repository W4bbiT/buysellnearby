import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Chat } from 'src/app/models/chat';
import { UsersService } from 'src/app/services/users.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  styleUrls: ['./chat-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChatListPage implements OnInit {
  userService = inject(UsersService)
  wsService = inject(WebSocketService)
  router = inject(Router)
  chats: Chat[] = [];

  constructor() { }

  ngOnInit() {
    this.getAllChatByUser();
  }

  async getAllChatByUser() {
    let res = await this.userService.getAllChatMessages();
    this.chats = res;
    console.log(this.chats);
    if(!this.chats){
      console.log("Empty");
    }
  }

  joinChat(receiver: string) {
    try {
      this.wsService.joinRoom(receiver);
      this.router.navigate(['/chat', receiver]);
    } catch (error) {
      console.error('Error joining chat:', error);
      // You can add further error handling or display a message to the user
    }
  }
  
}
