import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChatsPage implements OnInit, OnDestroy {
  recipientId: string = '';
  message: string = '';
  senderId: string = '';
  chatMessages: any[] = [];
  userService = inject(UsersService);
  constructor(private socketService: WebSocketService, private dbService: DatabaseService) {
  }

  ngOnInit(): void {
    this.userService.getProfile().then((senderProfile: any) => {
      this.senderId = senderProfile._id;
      // Load chat history on page initialization
      this.loadChatHistory();
      // Subscribe to new messages
      this.socketService.getMessage().subscribe((data: any) => {
        this.handleNewMessage(data);
      });
      // Subscribe to message errors
      this.socketService.onMessageError().subscribe((data: any) => {
        console.error('Error:', data.error);
      });
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  sendMessage(): void {
    const data = { recipient: this.recipientId, message: this.message };
    // Send the message through the WebSocketService
    this.socketService.sendMessage(data);
    // Save the message in the database
    this.dbService.addMessage('YourUserId', this.recipientId, this.message)
      .then(() => console.log('Message saved to the database'))
      .catch((error) => console.error('Error saving message to the database:', error));
    // Display the sent message in the chatMessages array
    this.chatMessages.push({ sender: 'You', message: this.message, timestamp: new Date() });
    // Clear the message input
    this.message = '';
  }

  private handleNewMessage(data: any): void {
    console.log('client:', data);
    if (data.message) {
      // Add the received message to the chatMessages array
      this.chatMessages.push({ sender: data.message.sender, message: data.message.message, timestamp: new Date() });
      // Save the received message in the database
      this.dbService.addMessage(data.message.sender, 'YourUserId', data.message.message)
        .then(() => console.log('Message saved to the database'))
        .catch((error) => console.error('Error saving message to the database:', error));
    }
  }

  private async loadChatHistory(): Promise<void> {
    try {
      // Load chat history between the sender and recipient
      const chatHistory = await this.dbService.getUserChat(this.senderId, this.recipientId);
      // Ensure chatHistory is an array before mapping
      if (Array.isArray(chatHistory)) {
        this.chatMessages = chatHistory.map((message) => {
          return { sender: message.sender, message: message.message, timestamp: new Date(message.timestamp) };
        });
      } else {
        console.error('Invalid chat history format:', chatHistory);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

}
