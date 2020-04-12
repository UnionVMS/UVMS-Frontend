import { Injectable } from '@angular/core';

import { MAIN_ENDPOINTS } from './main-endpoints';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';






// provide in main module?
@Injectable({
  providedIn: 'root',
})
export class MainService {

  constructor(private http: HttpClient) { }

  async countOpenAlarms(): Promise<any> {
    return this.http.get(`${environment.baseURL}${MAIN_ENDPOINTS.countOpenAlarms}`).toPromise();

  }

  countUserOpenTickets(username): Promise<any> {
    return this.http.get(`${environment.baseURL}${MAIN_ENDPOINTS.countUserOpenTickets}/${username}`).toPromise();
  }

}
