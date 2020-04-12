import { Component, OnInit, ElementRef } from '@angular/core';
// import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import { MainService } from './main.service';
import * as jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  // isAuthenticated$: Observable<boolean> ;
  openAlarms;
  openUserTickets;

  constructor(private store: Store<fromRoot.State>, private mainService: MainService, private element: ElementRef) { }

  ngOnInit(): void {
    // Does not persist page refresh
    // this.isAuthenticated$ = this.store.select(fromRoot.getIsAuthenticated);
    this.init();
  }


  init() {
    this.getOpenAlarms();
    this.getUserOpenTickets();
  }

  async getOpenAlarms() {
    this.openAlarms = await this.mainService.countOpenAlarms();
  }

  async getUserOpenTickets() {
    const { userName: username } = jwt_decode(localStorage.getItem('token'));
    this.openUserTickets = await this.mainService.countUserOpenTickets(username);
  }
}
