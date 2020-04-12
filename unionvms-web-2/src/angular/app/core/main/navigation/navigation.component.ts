import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../app.reducer';
import { take, throttleTime } from 'rxjs/operators';

import { AuthResponse } from 'app/auth/auth-response.model';
import { Observable, fromEvent } from 'rxjs';
import { NAVIGATION_TABS } from './navigation-tabs';
import { NavigationTab } from './navigation-tab.model';



@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  authenticatedUser$: Observable<AuthResponse> = this.store.select(fromRoot.getAuthenticatedUser);
  availableTabs: NavigationTab[];
  userPemissions: number[];

  // currentUrl$: Observable<>;

  constructor(private store: Store<fromRoot.State>, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    // this.authenticatedUser$.pipe(take(1)).subscribe(
    //   authUser => {
    //     this.userPemissions = authUser.permissions;
    //   }
    // );

    console.log(this.userPemissions);
    // A tab can be shown if appropriate permission exists withing the jwt token features array
    // this.availableTabs = NAVIGATION_TABS.filter(element => element.permissions.some(entry => this.userPemissions.includes(entry)));

    // No checks for now
    this.availableTabs = NAVIGATION_TABS;

    console.log(this.availableTabs);
    this.setUpAutoResize();


  }

  /* USE LATER FOR SETTING UP NAVIGATION RESPONSIVENESS */
  setUpAutoResize() {
    fromEvent(window, 'resize', { passive: true })
      .pipe(throttleTime(200))
      .pipe()
      .subscribe(() => {
        console.log('resize');
        console.log(window.innerWidth);
      });

  }

}
