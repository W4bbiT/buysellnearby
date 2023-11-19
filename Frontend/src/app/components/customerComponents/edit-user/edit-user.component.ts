import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/userModel';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
})

export class EditUserComponent implements OnInit {
  user: User
  userForm: FormGroup

  constructor(
    private userService: UsersService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userService.getOneUser()
      .subscribe({
        next: (res) => {
          if (res) {
            this.user = res;
          }
        },
        error: () => {
          alert('You are not authorized to visit this route.  No data is displayed.')
        }
      })

    this.userForm = this.formBuilder.group({
      fName: new FormControl(),
      lName: new FormControl(),
      email: new FormControl(),
      password: new FormControl(),
      dob: new FormControl(),
      phone: new FormControl(),
      address: this.formBuilder.group({
        streetAddress: new FormControl(),
        city: new FormControl(),
        state: new FormControl(),
        zipcode: new FormControl(),
      }),
      profileImage: new FormControl(),
    })
  }

  editUser() {
    const updatedUser = {
      ...this.userForm.value,
      address: {
        ...this.userForm.value.address
      }
    };
    this.userService.editUser(this.userForm.value)
      .subscribe({
        next: () => {
          alert("User edited successfully")
          this.router.navigate(['/profile'])
          console.log(this.userForm.value)
        },
        error: () => {
          alert("Check whats missing!")
        }
      })
  }
}