import { Injectable } from '@angular/core';

import { FEATURES_ENDPOINTS } from './features.endpoints';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { Organization } from './subscriptions/organization.model';
import { SubscriptionFormModel } from './subscriptions/subscription-form.model';





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

  createSubscription(subscription: SubscriptionFormModel): Promise<any> {
    // tslint:disable-next-line: max-line-length
    return this.http.post<SubscriptionFormModel>(`${environment.baseURL}${FEATURES_ENDPOINTS.createSubscription}`, subscription).toPromise();
  }

  editSubscription(subscription: SubscriptionFormModel, id) {
    // tslint:disable-next-line: max-line-length
    return this.http.put<SubscriptionFormModel>(`${environment.baseURL}${FEATURES_ENDPOINTS.createSubscription}/${id}`, subscription).toPromise();
  }

  getSubscriptionDetails(id): Promise<any> {
    return this.http.get<SubscriptionFormModel>(`${environment.baseURL}${FEATURES_ENDPOINTS.getSubscriptionDetails}/${id}`).toPromise();
  }



  checkNameOnCreate(name) {
    return this.http.get(`${environment.baseURL}${FEATURES_ENDPOINTS.checkSubscriptionName}?name=${name}`).toPromise();
  }


  checkNameOnEdit(name, id) {
    return this.http.get(`${environment.baseURL}${FEATURES_ENDPOINTS.checkSubscriptionName}?name=${name}&id=${id}`).toPromise();
  }


  getAreaLayers() {
    return this.http.get(`${environment.baseURL}${FEATURES_ENDPOINTS.getAreaLayers}`).toPromise();
  }
}
