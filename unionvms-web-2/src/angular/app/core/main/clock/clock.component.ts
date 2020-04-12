
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';





@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnInit {
  currentDate: string;
  currentTime: string;

  constructor() { }

  ngOnInit() {
    this.updateCurrentTime();
  }

  // We can refactor this later with an Observable
  getCurrentTime() {
    this.currentDate = moment.utc().format('YYYY-MM-DD');
    this.currentTime = moment.utc().format('HH:mm');
  }


  updateCurrentTime() {
    setInterval(() => {
      this.getCurrentTime();
    }, 1000);
  }









}
