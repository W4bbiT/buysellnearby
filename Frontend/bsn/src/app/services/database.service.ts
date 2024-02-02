import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Chat } from '../models/chat';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { UserApi } from '../models/user';
import { UsersService } from './users.service';


@Injectable({
  providedIn: 'root'
})


export class DatabaseService {
  private DB_CHAT = 'mychat'
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private messages: WritableSignal<Chat[]> = signal<Chat[]>([]);
  private user: any;
  userService = inject(UsersService);
  constructor() {
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      this.user = await this.userService.getProfile();
      this.db = await this.sqlite.createConnection(this.DB_CHAT, false, 'no-encryption', 1, false);
      await this.db.open();
      await this.createChatTable();
      await this.loadMessages();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private async createChatTable() {
    const schema = `CREATE TABLE IF NOT EXISTS chats (
      _id INTEGER PRIMARY KEY AUTOINCREMENT, 
      sender TEXT NOT NULL, 
      receiver TEXT NOT NULL, 
      message TEXT NOT NULL, 
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );`;
    await this.db.execute(schema);
  }

  async loadMessages() {
    try {
      const result = await this.db.query(
        'SELECT * FROM chats;');
      if (result.values) {
        this.messages.set(result.values || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async addMessage(receiver: string, message: string) {
    try {
      await this.db.execute('BEGIN TRANSACTION;');
      const query = 'INSERT INTO chats (sender, receiver, message) VALUES (?, ?, ?);';
      await this.db.query(query, [this.user._id, receiver, message]);
      await this.db.execute('COMMIT;');
      await this.loadMessages();
    } catch (error) {
      await this.db.execute('ROLLBACK;');
      console.error('Error adding message:', error);
    }
  }

  async getChatList(userId: string) {
    try {
      const query = `
        SELECT DISTINCT sender, receiver FROM chats
        WHERE sender = ? OR receiver = ?;`;
      const result = await this.db.query(query, [userId, userId]);
      return result.values || [];
    } catch (error) {
      console.error('Error getting chat list:', error);
      return [];
    }
  }

  async getUserChat(sender: string, receiver: string) {
    try {
      const query = `
        SELECT * FROM chats
        WHERE (sender = ? AND receiver = ?)
        OR (sender = ? AND receiver = ?)
        ORDER BY timestamp;`;
      const result = await this.db.query(query, [sender, receiver, receiver, sender]);
      return result.values || [];
    } catch (error) {
      console.error('Error getting user chat:', error);
      return [];
    }
  }
}
