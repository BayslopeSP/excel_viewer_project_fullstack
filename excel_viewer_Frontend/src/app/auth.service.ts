import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
    // private apiUrl = 'http://localhost:8000/api/'; // backend ka URL
    // https://excel-viewer-project-fullstack.onrender.com
  private apiUrl = 'https://excel-viewer-project-fullstack.onrender.com/api/';

  constructor(private http: HttpClient, private router: Router) {}
// 
  // JWT login
//   
// 
// 
// 
// djangorestframework-simplejwt
//
//
//
//
//
//
//
//

  login(username: string, password: string) {
    return this.http
      .post<any>(this.apiUrl + 'login/', { username, password })
      .pipe(
        tap((res) => {
          this.setTokens(res.access, res.refresh);
        })
      );
  }

  // Register → user create karega
  signup(username: string, email: string, password: string) {
    return this.http.post<any>(this.apiUrl + 'register/', {
      username,
      email,
      password,
    });
  }

  // Token store karna
  private setTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  isLoggedIn() {
    return !!this.getAccessToken();
  }
}
