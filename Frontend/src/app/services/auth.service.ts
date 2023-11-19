import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const AUTH_API = `https://azar-backend.onrender.com/api/user`

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private http: HttpClient) { }

  login(credentials: { email: any; password: any; }): Observable<any>{
    return this.http.post(AUTH_API + '/signin', {
      email: credentials.email,
      password: credentials.password
    }, httpOptions)
  }

  register(user: { fName: any; lName: any; email: any; password: any; }): Observable<any>{
    return this.http.post(AUTH_API + '/signup', {
      fName : user.fName,
      lName : user.lName,
      email : user.email,
      password : user.password
    }, httpOptions)
  }

  logout(): Observable<any> {
    return this.http.post(AUTH_API + '/signout', { }, httpOptions);
  }
}
