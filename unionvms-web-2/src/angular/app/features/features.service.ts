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
    debugger;
    // tslint:disable-next-line: max-line-length
    return this.http.put<SubscriptionFormModel>(`${environment.baseURL}${FEATURES_ENDPOINTS.createSubscription}/${id}`, subscription).toPromise();
  }

  getSubscriptionDetails(id): Promise<any> {
    debugger;
    // return this.http.get<SubscriptionFormModel>(`${environment.baseURL}${FEATURES_ENDPOINTS.getSubscriptionDetails}/${id}`).toPromise();
    return of({
      "data": {
        "id": 108,
        "name": "mySub1",
        "accessibility": "SCOPE",
        "description": "description",
        "active": true,
        "output": {
            "alert": true,
            "emails": [
                "mail1",
                "mail2"
            ],
            "messageType": "FA_REPORT",
            "subscriber": {
                "organisationId": 4,
                "endpointId": 5,
                "channelId": 1
            },
            "logbook": true,
            "consolidated": true,
            "vesselIds": [
                "CFR",
                "IRCS"
            ],
            "generateNewReportId": true,
            "history": 1
        },
        "execution": {
            "triggerType": "MANUAL",
            "frequency": 1,
            "immediate": true,
            "timeExpression": "06:00"
        },
        "startDate": "2016-08-01T11:50:16",
        "endDate": "9999-01-01T00:00:00"
    },
    "code": 200
  }).toPromise();
  }
}
