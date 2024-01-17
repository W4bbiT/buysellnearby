import { Injectable, inject } from '@angular/core';
import { Chat } from '../models/chat';
import { io } from 'socket.io-client'
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: any;
  private token: any;
  private tokenService = inject(TokenStorageService)
  constructor() {
    this.tokenService.get('accessToken').then(token => {
      this.token = token;
      this.initializeSocket();
    });
  }

  private initializeSocket(): void {
    this.socket = io('http://localhost:3000', {
      extraHeaders: {
        Authorization: this.token,
      },
    });
  }

  sendMessage(data: { recipient: string, message: string }): void {
    this.socket.emit('sendMessage', data);
    console.log(data);
  }

  // Function to listen for new messages
  onNewMessage(): Observable<any> {
    return new Observable(observer => {
      // Check if the socket is initialized before using the 'on' method
      if (this.socket) {
        this.socket.on('newMessage', (data: any) => observer.next(data));
      }
    });
  }

  // Function to handle errors
  onMessageError(): Observable<any> {
    return new Observable(observer => {
      // Check if the socket is initialized before using the 'on' method
      if (this.socket) {
        this.socket.on('messageError', (data: any) => {
          observer.next(data),
            console.log(data);
        });
      }
    });
  }

  // Function to disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
