import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/userModel';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.css']
})
export class ProfileMenuComponent implements OnInit {
  isLoggedIn = false;
  isLoggedOut = false;
  email: string
  currentUser: User
  msg: String
  isMenuOpened: boolean = false

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
          error: (err) => {
            if (err.status === 401) {
              this.msg = 'You are not authorized to visit this route.  No data is displayed.';
            }
            console.log(err);
          }
        });
    }
  }

  logout(): void {
    this.tokenStorageService.logout()
    window.location.reload()
  }
  
  toggleMenu(): void {
    this.isMenuOpened = !this.isMenuOpened;
  }

  clickedOutside(): void {
    this.isMenuOpened = false;
  }

}
