import { Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionFormModel } from '../subscription-form.model';
import { FeaturesService } from '../../features.service';
import { SubscriptionFormComponent } from '../subscription-form/subscription-form.component';
import { subscriptionFormInitialValues } from '../subscriptions-helper';
import { FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import * as SUB from '../subscriptions.actions';
interface Alert {
  type: string;
  title: string;
  body: object[];
}

@Component({
  selector: 'app-new-subscription',
  templateUrl: './new-subscription.component.html',
  styleUrls: ['./new-subscription.component.scss']
})
export class NewSubscriptionComponent implements OnInit {
  @ViewChild(SubscriptionFormComponent)
  private subscriptionFormComponent: SubscriptionFormComponent;
  subscription: SubscriptionFormModel;
  alerts: Alert[];
  mode = 'New';

  constructor(private featuresService: FeaturesService, private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
  }

  async createSubscription($event) {
    console.log('create');
    try {
      const result = await this.featuresService.createSubscription($event);
      const assets = this.subscriptionFormComponent.subscriptionForm.get('assets') as FormArray;
      assets.clear();
      const stopActivities = this.subscriptionFormComponent.subscriptionForm.get('stopActivities') as FormArray;
      stopActivities.clear();
      const startActivities = this.subscriptionFormComponent.subscriptionForm.get('startActivities') as FormArray;
      startActivities.clear();
      this.subscriptionFormComponent.subscriptionForm.reset(subscriptionFormInitialValues);
      this.subscriptionFormComponent.numberOfSelectedAreas = 0;
      this.subscriptionFormComponent.numberOfSelectedAssets = 0;
      const emails = this.subscriptionFormComponent.subscriptionForm.get('output.emails') as FormArray;
      emails.clear();
      const areas = this.subscriptionFormComponent.subscriptionForm.get('areas') as FormArray;
      areas.clear();
      // Inform all subscribed components to clear previous values for non-form fields
      this.store.dispatch(new SUB.ClearSubscriptionForm({
        status: true
      }));
      this.store.dispatch(new SUB.ToggleSubscriptionAreasSection({
        status: true
      }));

      this.alerts = [];
      this.alerts.push({
        type: 'success',
        title: 'Success',
        body: [{
            message: 'Subscription Successfully saved!'
        }]
      });
    } catch (err) {
      // empty alerts
      this.alerts = [];
      this.alerts.push({
        type: 'danger',
        title: 'Subscription could not be saved',
        body: err.error.data
      });
    }
  }


  async checkName($event) {
    if ($event) {
      try {
        const result: any = await this.featuresService.checkNameOnCreate($event);
        const { data } = result;
        if (!data) {
          // tslint:disable-next-line: no-string-literal
          this.subscriptionFormComponent.subscriptionForm.controls['name'].setErrors({ 'incorrect': true});
        }
      } catch (err) {
      }
    }
  }

}
