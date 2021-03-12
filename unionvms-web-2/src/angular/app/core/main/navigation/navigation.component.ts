import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import * as fromRoot from '../../../app.reducer';
import {throttleTime} from 'rxjs/operators';

import {AuthResponse} from 'app/auth/auth-response.model';
import {fromEvent, Observable} from 'rxjs';
import {NAVIGATION_TABS} from './navigation-tabs';
import {NavigationTab} from './navigation-tab.model';
import {environment} from "../../../../environments/environment";
import {AuthService} from "../../../auth/auth.service";
import {Context, Feature, UserContexts} from "../../../auth/user-contexts.model";


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

  constructor(private store: Store<fromRoot.State>, private activatedRoute: ActivatedRoute, private authService: AuthService) { }

  ngOnInit() {
    let scopeName = localStorage.getItem('scopeName');
    let roleName = localStorage.getItem('roleName');
    this.authService.getUserContexts().toPromise().then((contexts: UserContexts) => {
      let currentContext: Context = contexts.contextSet.contexts.find((context:Context)  => {
        return context.scope && context.scope.scopeName === scopeName && context.role && context.role.roleName === roleName;
      });
      this.userPemissions = currentContext.role.features.map((feature: Feature) => {
        return feature.featureId;
      });
      this.setAvailableTabs();
    });
    this.setUpAutoResize();
  }

  private setAvailableTabs() {

    let movementTab = NAVIGATION_TABS[5];
    if(this.userPemissions.includes(267)) { //viewMovements
      movementTab['href'] = `${environment.oldBaseURL}/#/movement`;
    } else if (this.userPemissions.includes(276)) { //viewManualMovements
      movementTab['href'] = `${environment.oldBaseURL}/#/movement/manual`;
    } else {
      movementTab['permissions'] = [-1]; //tab is not shown
    }

    let alarmsTab = NAVIGATION_TABS[9];
    if(this.userPemissions.includes(208)) { //viewAlarmsHoldingTable
      alarmsTab['href'] = `${environment.oldBaseURL}/#/alerts/holdingtable`;
    } else if (this.userPemissions.includes(210)) { //viewAlarmsOpenTickets
      alarmsTab['href'] = `${environment.oldBaseURL}/#/alerts/notifications`;
    } else if (this.userPemissions.includes(206)) { //viewAlarmRules
      alarmsTab['href'] = `${environment.oldBaseURL}/#/alerts/rules`;
    } else {
      alarmsTab['permissions'] = [-1]; //tab is not shown
    }

    let usersTab = NAVIGATION_TABS[10];
    if(this.userPemissions.includes(100001) || this.userPemissions.includes(100000)) { // manageUsers or viewUsers
      usersTab['href'] = `${environment.oldBaseURL}/#/usm/users`;
    } else if (this.userPemissions.includes(100004) || this.userPemissions.includes(100003)) { //manageOrganisations or viewOrganisations
      usersTab['href'] = `${environment.oldBaseURL}/#/usm/organisations`;
    } else if (this.userPemissions.includes(100011) || this.userPemissions.includes(100010)) { //manageRoles or viewRoles
      usersTab['href'] = `${environment.oldBaseURL}/#/usm/roles`;
    } else if (this.userPemissions.includes(100015) || this.userPemissions.includes(100014)) { //manageScopes or viewScopes
      usersTab['href'] = `${environment.oldBaseURL}/#/usm/scopes`;
    } else if (this.userPemissions.includes(100006) || this.userPemissions.includes(100005)) { //manageApplications or viewApplications
      usersTab['href'] = `${environment.oldBaseURL}/#/usm/applications`;
    } else if (this.userPemissions.includes(100018)) { //configurePolicies
      usersTab['href'] = `${environment.oldBaseURL}/#/usm/policies`;
    } else if (this.userPemissions.includes(100001)) { //manageUsers
      this.authService.getUserIsReviewContactDetailsEnabled().toPromise().then( resp => {
        if(!resp['result']) {
          usersTab['href'] = `${environment.oldBaseURL}/#/usm/changes`;
          this.availableTabs = NAVIGATION_TABS.filter(element =>!element.permissions || element.permissions.some(entry => this.userPemissions.includes(entry)));
        }
      });
    } else {
      usersTab['permissions'] = [-1]; //tab is not shown
    }

    let adminTab = NAVIGATION_TABS[11];
    if (this.userPemissions.includes(286)) { //viewAudit
      adminTab['href'] = `${environment.oldBaseURL}/#/admin/auditlog`;
    } else if (this.userPemissions.includes(214)) { //viewConfiguration
      adminTab['href'] = `${environment.oldBaseURL}/#/admin/configuration`;
    } else {
      adminTab['permissions'] = [-1]; //tab is not shown
    }
    this.availableTabs = NAVIGATION_TABS.filter(element =>!element.permissions || element.permissions.some(entry => this.userPemissions.includes(entry)));

  }

  /* USE LATER FOR SETTING UP NAVIGATION RESPONSIVENESS */
  setUpAutoResize() {
    fromEvent(window, 'resize', { passive: true })
      .pipe(throttleTime(200))
      .pipe()
      .subscribe(() => {
//        console.log('resize');
//        console.log(window.innerWidth);
      });

  }

}
