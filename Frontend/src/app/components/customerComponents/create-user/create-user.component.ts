import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent implements OnInit {
  userForm !: FormGroup
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      fName: [''],
      lName: [''],
      email: [''],
      password: [''],
      dob: [''],
    })
  }

  onSubmit(){
    if(this.userForm.valid){
      this.authService.register(this.userForm.value)
      .subscribe({
        next:(res) => {
          console.log(res);
          window.location.reload()
          alert("User created successfully")
        },
        error:(err)=>{
          alert("Check whats missing!")
        }
      })
    }
  }

}
