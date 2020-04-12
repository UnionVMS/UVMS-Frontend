import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import * as AUTH from '../auth.actions';
import * as jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private authService: AuthService, private router: Router, private store: Store<fromRoot.State>) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      userName: new FormControl('', {
        validators: [Validators.required]
      }),
      password: new FormControl('', { validators: [Validators.required] })
    });
  }
  // FOR FUTURE USE
  // onSubmit() {
  //   const { userName, password } = this.loginForm.value;
  //   const authData = {
  //     userName,
  //     password
  //   };
  //   this.authService.login(authData).pipe().subscribe(
  //     resp => {
  //       console.log(resp);
  //       if (resp.authenticated) {
  //         this.store.dispatch(new AUTH.Authenticate());
  //         // decode jwt and get username, then pass it as payload
  //         const { userName: username, features: permissions } = jwt_decode(resp.jwtoken);
  //         const user = {
  //           ...resp,
  //           username,
  //           permissions
  //         };
  //         this.store.dispatch(new AUTH.SetAuthenticatedUser(user));
  //         localStorage.setItem('token', resp.jwtoken);
  //         localStorage.setItem('sessionId', resp.sessionId);
  //         localStorage.setItem('username', username);
  //         this.router.navigate(['/main']);
  //       } else {
  //         this.store.dispatch(new AUTH.Unauthenticate());
  //       }
  //     },
  //     error => {
  //       // NgRX operations


  //     }
  //   );

  //   this.authService.getUserContexts().pipe().subscribe(
  //     resp => {
  //       console.log(resp);
  //       this.store.dispatch(new AUTH.SetAuthenticatedUserContexts(resp));
  //     }, error => {

  //     }
  //   );

  // }

}
