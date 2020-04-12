import { AuthService } from './../../../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../app.reducer';
import * as AUTH from '../../../auth/auth.actions';

// import { AuthResponse } from 'src/app/auth/auth-response.model';
// import { Observable } from 'rxjs';
import { faSignOutAlt, faQuestion, faBell, faUser } from '@fortawesome/free-solid-svg-icons';
// import { UserContexts } from 'src/app/auth/user-contexts.model';
import * as jwt_decode from 'jwt-decode';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  faSignOutAlt = faSignOutAlt;
  faQuestion = faQuestion;
  faBell = faBell;
  faUser = faUser;
  username: string;

  // isAuthenticated$: Observable<boolean> = this.store.select(fromRoot.getIsAuthenticated);
  // authenticatedUser$: Observable<AuthResponse> = this.store.select(fromRoot.getAuthenticatedUser);
  // authenticatedUserContexts$: Observable<UserContexts> = this.store.select(fromRoot.getAuthenticatedUserContexts);

  constructor(private store: Store<fromRoot.State>, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    // get username from token in local storage
    const { userName: username } = jwt_decode(localStorage.getItem('token'));
    this.username = username;
  }

  async signOut() {
    const sessionId = localStorage.getItem('sessionId');
    try {
      // send the sign out rest call
      const response = await this.authService.logOut(sessionId);
      this.store.dispatch(new AUTH.Unauthenticate());
      // redirect to old signout page
      window.location.href = `${environment.oldBaseURL}/#/logout`;

    } catch (err) {

    }
  }

  viewNotifications() {

  }




}
