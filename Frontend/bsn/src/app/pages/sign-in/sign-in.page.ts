import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service'
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class SignInPage implements OnInit {

  fb = inject(FormBuilder);
  router = inject(Router)
  loginForm = this.fb.group({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  constructor(private authService: AuthService) { }

  ngOnInit() {

  }

 async onSubmit() {
    if (this.loginForm.invalid) {
      return
    }
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      // Explicitly cast to non-nullable types
      const credentials: { email: string; password: string } = { email: email!, password: password! };
      this.authService.signIn(credentials)
      this.router.navigateByUrl('/profile')
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
