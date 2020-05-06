import { Component, OnInit } from '@angular/core';
import { SubscriptionFormModel } from '../subscription-form.model';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-new-subscription',
  templateUrl: './new-subscription.component.html',
  styleUrls: ['./new-subscription.component.scss']
})
export class NewSubscriptionComponent implements OnInit {
  subscription: SubscriptionFormModel;

  constructor(private featuresService: FeaturesService) { }

  ngOnInit(): void {
  }

  async createSubscription($event) {
    console.log('create');
    const result = await this.featuresService.createSubscription($event);
  }

}
