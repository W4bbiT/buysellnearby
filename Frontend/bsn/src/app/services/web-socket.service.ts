import { Injectable, inject } from '@angular/core';
import { io } from "socket.io-client";
import { BehaviorSubject, Observable, map } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from 'src/environments/environment';

const backendURL = environment.BACKEND_ENDPOINT;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private tokenService = inject(TokenStorageService)
  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  private socket: any;
  private token: string = "";
  constructor() {
    this.tokenService.get('accessToken').then(token => {
      this.token = token;
      this.initializeSocket();
    });
  }

  private initializeSocket(): void {
    this.socket = io(backendURL, {
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
  getMessage() {
    if (this.socket) {
      this.socket.on('newMessage', (data: any) => {
        this.message$.next(data);
        console.log(data);
      });
    }
    return this.message$.asObservable();
  }

  // Function to handle errors
  onMessageError(): Observable<any> {
    return new Observable(subscribe => {
      // Check if the socket is initialized before using the 'on' method
      if (this.socket) {
        this.socket.on('messageError', (data: any) => {
          subscribe.next(data);
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
  joinRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('joinRoom', userId);
    }
  }
}
