import { Injectable, WritableSignal, signal } from '@angular/core';
import { Chat } from '../models/chat';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';


@Injectable({
  providedIn: 'root'
})


export class DatabaseService {
  private DB_CHAT = 'mychat'
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private messages: WritableSignal<Chat[]> = signal<Chat[]>([]);

  constructor() {
    this.initDatabase();
  }

  private async initDatabase() {
    this.db = await this.sqlite.createConnection(
      this.DB_CHAT,
      false,
      'no-encryption',
      1,
      false
    );
    await this.db.open();

    const schema = `CREATE TABLE IF NOT EXISTS chats 
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT, 
      sender TEXT NOT NULL, 
      receiver TEXT NOT NULL, 
      message TEXT NOT NULL, 
      timestamp DATE DEFAULT CURRENT_TIMESTAMP NOT NULL  
    );`;
    await this.db.execute(schema);
    this.loadMessages();
    return true;
  }

  async loadMessages() {
    const messages = await this.db.query('SELECT * FROM chats;');
    this.messages.set(messages.values || []);
  }

  async addMessage(sender: string, receiver: string, message: string) {
    const query = `INSERT INTO chats (sender, receiver, message) VALUES ('${sender}', '${receiver}', '${message}');`;
    const result = await this.db.query(query);
    this.loadMessages();
    return result;
  }

  async getChatList(userId: string) {
    const query = `
      SELECT DISTINCT sender, receiver FROM chats
      WHERE sender = '${userId}' OR receiver = '${userId}';`;
    const chatList = await this.db.query(query);
    return chatList;
  }

  async getUserChat(sender: string, receiver: string) {
    const query = `
      SELECT * FROM chats
      WHERE (sender = '${sender}' AND receiver = '${receiver}')
         OR (sender = '${receiver}' AND receiver = '${sender}')
      ORDER BY timestamp;`;
    const messages = await this.db.query(query);
    const chatHistory: Chat[] = messages.values || [];
    this.messages.set(chatHistory);
  }

}
