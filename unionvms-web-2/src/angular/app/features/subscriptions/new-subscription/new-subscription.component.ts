import { Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionFormModel } from '../subscription-form.model';
import { FeaturesService } from '../../features.service';
import { SubscriptionFormComponent } from '../subscription-form/subscription-form.component';

@Component({
  selector: 'app-new-subscription',
  templateUrl: './new-subscription.component.html',
  styleUrls: ['./new-subscription.component.scss']
})
export class NewSubscriptionComponent implements OnInit {
  @ViewChild(SubscriptionFormComponent)
  private subscriptionFormComponent: SubscriptionFormComponent;
  subscription: SubscriptionFormModel;
  errorMessage = '';

  constructor(private featuresService: FeaturesService) { }

  ngOnInit(): void {
  }

  async createSubscription($event) {
    console.log('create');
    try {
      const result = await this.featuresService.createSubscription($event);

    } catch (err) {
      this.errorMessage = 'There is an error';

    }
  }


  async checkName($event) {
    try {
      const result: any = await this.featuresService.checkNameOnCreate($event);
      const { data } = result;
      if (!data) {
        // tslint:disable-next-line: no-string-literal
        this.subscriptionFormComponent.subscriptionForm.controls['name'].setErrors({ 'incorrect': true});
      }
    } catch (err) {
      this.errorMessage = 'There is an error';
    }

  }

}
