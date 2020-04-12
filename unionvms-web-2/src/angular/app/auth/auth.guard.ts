import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../app.reducer';
import { tap } from 'rxjs/operators';



@Injectable()
export class AuthGuard implements CanActivate {
  canActivateRoute: boolean;


  constructor(private store: Store<fromRoot.State>, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // This does not persist page refresh
    // this.store.select(fromRoot.getIsAuthenticated).pipe(tap(result => this.canActivateRoute = result)).subscribe();

    // if (this.canActivateRoute) {
    //     return true;
    // }
    const TOKEN = localStorage.getItem('token');

    if (TOKEN) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
