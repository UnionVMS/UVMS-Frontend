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


  getSystemAreaLayers() {
    return this.http.get(`${environment.baseURL}${FEATURES_ENDPOINTS.getSystemAreaLayers}`).toPromise();
  }

  getUserAreaLayers() {
    return this.http.get(`${environment.baseURL}${FEATURES_ENDPOINTS.getUserAreaLayers}`).toPromise();
  }

  getMapBasicConfig() {
    // return this.http.get(`${environment.baseURL}${FEATURES_ENDPOINTS.getBasicMapConfig}`).toPromise();
    return of({
        "data":{
           "map":{
              "projection":{
                 "epsgCode":3857,
                 "units":"m",
                 "global":true,
                 "extent":"-20026376.39;-20048966.10;20026376.39;20048966.10",
                 "axis":"enu",
                 "projDef":"+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs",
                 "worldExtent":"-180;-89.99;180;89.99"
              },
              "control":[
                 {
                    "type":"zoom"
                 },
                 {
                    "type":"drag"
                 },
                 {
                    "type":"scale",
                    "units":"nautical"
                 },
                 {
                    "type":"mousecoords",
                    "epsgCode":4326,
                    "format":"dd"
                 },
                 {
                    "type":"history"
                 }
              ],
              "layers":{
                 "baseLayers":[
                    {
                       "type":"OSM",
                       "title":"OpenStreetMap",
                       "isBaseLayer":true,
                       "typeName":"OSM"
                    },
                    {
                       "type":"BING",
                       "title":"bing_roads",
                       "isBaseLayer":true,
                       "layerGeoName":"Road",
                       "apiKey":"ssss",
                       "typeName":"BINGROAD"
                    },
                    {
                       "type":"BING",
                       "title":"bing_aerial",
                       "isBaseLayer":true,
                       "layerGeoName":"Aerial",
                       "apiKey":"ssss",
                       "typeName":"BINGAREAL"
                    },
                    {
                       "type":"BING",
                       "title":"bing_aerial_labels",
                       "isBaseLayer":true,
                       "layerGeoName":"AerialWithLabels",
                       "apiKey":"ssss",
                       "typeName":"BINGAREALLABELS"
                    }
                 ]
              }
           }
        },
        "code":200
     }).toPromise();
  }

  getUserAreasByFilter(filter) {
    return this.http.post(`${environment.baseURL}${FEATURES_ENDPOINTS.getUserAreasByFilter}`, filter).toPromise();
  }
  getSystemAreasByFilter(filter) {
    return this.http.post(`${environment.baseURL}${FEATURES_ENDPOINTS.getSystemAreasByFilter}`, filter).toPromise();
  }

  getAreaProperties(areas) {
    return this.http.post(`${environment.baseURL}${FEATURES_ENDPOINTS.getAreaProperties}`, areas).toPromise();
  }

  getAreaDetails(data) {
    return this.http.post(`${environment.baseURL}${FEATURES_ENDPOINTS.getAreaDetails}`, data).toPromise();
  }
}
