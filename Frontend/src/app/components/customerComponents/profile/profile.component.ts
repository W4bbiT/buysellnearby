import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/userModel';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {

  currentUser: User
  msg: String
  isLoggedIn = false;

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



}



