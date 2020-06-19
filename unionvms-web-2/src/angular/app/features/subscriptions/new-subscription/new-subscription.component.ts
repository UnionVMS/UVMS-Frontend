import { Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionFormModel } from '../subscription-form.model';
import { FeaturesService } from '../../features.service';
import { SubscriptionFormComponent } from '../subscription-form/subscription-form.component';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import * as SUB from '../subscriptions.actions';
import { Router } from '@angular/router';
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

  constructor(private featuresService: FeaturesService, private store: Store<fromRoot.State>, private router: Router) {}

  ngOnInit(): void {
  }

  async createSubscription($event) {
    console.log('create');
    try {
      const result = await this.featuresService.createSubscription($event);
      this.store.dispatch(new SUB.ToggleSubscriptionAreasSection({
        status: false
      }));

      this.router.navigate(['subscriptions/edit-subscription', result.data.id], {state: {data: {success: true}}});
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
