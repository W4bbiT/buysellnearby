import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/userModel';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-login-menu',
  templateUrl: './login-menu.component.html',
  styleUrls: ['./login-menu.component.css'],
})
export class LoginMenuComponent implements OnInit {
  isLoggedIn = false;
  isLoggedOut = false;
  email: string
  currentUser: User
  msg: String
  isLoginMenuOpened: boolean = false
  isRegisterMenuOpened: boolean = false

  constructor(private tokenStorageService: TokenStorageService,
    private userService: UsersService) { } 

  ngOnInit(): void {
    this.isLoggedIn = this.tokenStorageService.isLoggedIn()
    if (this.isLoggedIn) {
      this.userService.getOneUser()
        .subscribe({
          next: (res) => {
            if (res) {
              this.currentUser = res;
            }
          },
          error:(err) => {
            if (err.status === 401) {
              this.msg = 'You are not authorized to visit this route.  No data is displayed.';
            }

            console.log(err);
          }
        });
    }
  }

    
  toggleLoginMenu(): void {
    this.isLoginMenuOpened = !this.isLoginMenuOpened;
  }

  toggleRegisterMenu(): void {
    this.isRegisterMenuOpened = !this.isRegisterMenuOpened;
  }

  clickedOutside(): void {
    this.isLoginMenuOpened = false;
this.isRegisterMenuOpened = false;
  }

}
