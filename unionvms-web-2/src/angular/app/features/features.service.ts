import { Injectable } from '@angular/core';

import { FEATURES_ENDPOINTS } from './features.endpoints';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { Organization } from './subscriptions/organization.model';





// provide in features module?
@Injectable({
  providedIn: 'root',
})
export class FeaturesService {

  constructor(private http: HttpClient) { }

  getOrganizations(): Promise<any> {
    return this.http.get<Organization[]>(`${environment.baseURL}${FEATURES_ENDPOINTS.getOrganizations}`).toPromise();
  }

  fetchSubscriptionsList(searchObj): Promise<any> {
    return this.http.post(`${environment.baseURL}${FEATURES_ENDPOINTS.getSubscriptionsList}`, searchObj).toPromise();
  }

  getOrganizationDetails(organizationId): Promise<Organization> {
    return this.http.get<Organization>(`${environment.baseURL}${FEATURES_ENDPOINTS.getOrganizationDetails}${organizationId}`).toPromise();
  }

  saveSubscription() {

  }

  editSubscription() {
      
  }

}
