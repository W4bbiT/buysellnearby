import { Component } from '@angular/core';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  title = 'Azar&Co';
  totalQuantity: number = 0;
  loggedIn: boolean
  constructor(
    private userService: UsersService,
    private tokenStorage: TokenStorageService) {}

  ngOnInit(): void {
  }
}
