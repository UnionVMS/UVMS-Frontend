import { Injectable } from '@angular/core';

import { MAIN_ENDPOINTS } from './main-endpoints';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponseDto } from 'app/features/features.model';


// provide in main module?
@Injectable({
  providedIn: 'root',
})
export class MainService {

  constructor(private http: HttpClient) { }

  async countOpenAlarms(): Promise<ResponseDto<number>> {
    return this.http.get<ResponseDto<number>>(`${environment.baseURL}${MAIN_ENDPOINTS.countOpenAlarms}`).toPromise();
  }

  countUserOpenTickets(username): Promise<ResponseDto<number>> {
    return this.http.get<ResponseDto<number>>(`${environment.baseURL}${MAIN_ENDPOINTS.countUserOpenTickets}/${username}`).toPromise();
  }
}
