import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
onEditProfile() {
throw new Error('Method not implemented.');
}
  profileData: any;
  private usersService = inject(UsersService);
  private navCtrl = inject(NavController);

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    this.profileData = await this.usersService.getProfile();

  }

  onSignOut(){
    this.authService.signOut();
  }

}
