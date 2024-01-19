import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChatsPage implements OnInit {
  recipientId: string = '';
  message: string = '';
  senderId: string = '';
  chatMessages: any[] = [];
  constructor(private socketService: WebSocketService) {

  }

  ngOnInit(): void {
    this.socketService.getMessage().subscribe((data: any) => {
      console.log('client:', data);
      if (data.message) {
        this.chatMessages.push({ sender: data.message.sender, message: data.message.message });
      }
    });
  
    this.socketService.onMessageError().subscribe((data: any) => {
      console.error('Error:', data.error);
    });
  }

  sendMessage(): void {
    const data = { recipient: this.recipientId, message: this.message };
    this.socketService.sendMessage(data);
    console.log(data);
    this.chatMessages.push({ sender: 'You', message: this.message });
    this.message = '';
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
