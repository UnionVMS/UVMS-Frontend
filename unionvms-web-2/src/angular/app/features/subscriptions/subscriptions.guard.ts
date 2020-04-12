import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class SubscriptionsGuard implements CanActivate {
  canActivateRoute: boolean;


  constructor() {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const TOKEN = this.checkToken();
    if (TOKEN === 'null') {
      // redirect to old signin page
      window.location.href = `${environment.oldBaseURL}/#/login`;
      return false;
    }
    return true;
  }

  checkToken() {
    let token;
    if (isDevMode()) {
      token = localStorage.getItem('token');
    } else {
      token = localStorage.getItem('ngStorage-token');
    }
    return token;
  }
}
