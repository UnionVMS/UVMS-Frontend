import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import { MainService } from './main.service';
import * as jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  openAlarms: number;
  openUserTickets: number;
  private intervalId: any;

  constructor(private store: Store<fromRoot.State>, private mainService: MainService, private element: ElementRef) { }

  ngOnInit(): void {
    this.init();
    this.intervalId = setInterval(this.init.bind(this), 60000);
  }

  private init() {
    this.getOpenAlarms();
    this.getUserOpenTickets();
  }

  private async getOpenAlarms() {
    const openAlarmsResponse = await this.mainService.countOpenAlarms();
    this.openAlarms = openAlarmsResponse.data;
  }

  private async getUserOpenTickets() {
    const { userName: username } = jwt_decode(localStorage.getItem('token'));
    const openUserTicketsResponse = await this.mainService.countUserOpenTickets(username);
    this.openUserTickets = openUserTicketsResponse.data;
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
