import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  public user: Observable<any> | undefined;

  constructor( private storage: Storage) {
    this.initStorage();
  }

  async initStorage(){
    await this.storage.create();
  }

  async set(key: string, value: any){
    await this.storage.set(key, value);
    return true;
  }

  async get(key: string){
    const value = await this.storage.get(key);

    return value;
  }

  async remove(key: string){
    await this.storage.remove(key);
  }
  async clean(){
    await this.storage.clear();
  }
}