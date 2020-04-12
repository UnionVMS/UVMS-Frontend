import { Injectable } from '@angular/core'
import { AuthData } from './auth-data.model';
import { AUTH_ENDPOINTS } from './auth-endpoints';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from './auth-response.model';
import { environment } from '../../environments/environment';
import { UserContexts } from './user-contexts.model';




// provide in auth module?
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(authData: AuthData): Observable<AuthResponse> {
     return this.http.post<AuthResponse>(`${environment.baseURL}${AUTH_ENDPOINTS.userLogin}`, authData);
  }

  getUserContexts() {
    return this.http.get<UserContexts>(`${environment.baseURL}${AUTH_ENDPOINTS.getUserContexts}`);
  }

  logOut(sessionId) {
    return this.http.delete(`${environment.baseURL}${AUTH_ENDPOINTS.userLogout}${sessionId}`).toPromise();
  }
}
