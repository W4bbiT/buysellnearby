import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Chat } from 'src/app/models/chat';
import { UsersService } from 'src/app/services/users.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';

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
  dbService = inject(DatabaseService);
  chats: any[] = [];
  constructor() { }

  ngOnInit() {
    this.userService.getProfile().then((profile) => {
      const userId = profile._id;
      this.getAllChatMessages(userId);
    });
  }

  async getAllChatMessages(userId: string): Promise<void> {
    try {
      const chatList = await this.dbService.getChatList(userId);  
      // Ensure chatList is an array before assigning
      if (Array.isArray(chatList)) {
        this.chats = chatList;
      } else {
        console.error('Invalid chat list format:', chatList);
      }
    } catch (error) {
      console.error('Error getting chat list:', error);
    }
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
