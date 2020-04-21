import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SubscriptionFormModel } from '../subscription-form.model';
import { FeaturesService } from '../../features.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionFormComponent } from '../subscription-form/subscription-form.component';


@Component({
  selector: 'app-edit-subsription',
  templateUrl: './edit-subsription.component.html',
  styleUrls: ['./edit-subsription.component.scss']
})
export class EditSubsriptionComponent implements OnInit, AfterViewInit {
  subscription: SubscriptionFormModel;
  @ViewChild(SubscriptionFormComponent)
  private subscriptionFormComponent: SubscriptionFormComponent;
  currentSubscription;
  currentSubscriptionId;
  errorMessage = '';

  constructor(private featuresService: FeaturesService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.currentSubscriptionId = +this.activatedRoute.snapshot.paramMap.get('id');

  }

  async ngAfterViewInit() {
    const result = await this.featuresService.getSubscriptionDetails(this.currentSubscriptionId);
    this.currentSubscription = result.data;

    this.subscriptionFormComponent.subscriptionForm.patchValue(this.currentSubscription);
    this.subscriptionFormComponent.subscriptionForm.updateValueAndValidity();



  }



  async editSubscription($event) {
    console.log('edit');
    try {
      const result = this.featuresService.editSubscription($event, this.currentSubscriptionId);

    } catch (err) {
      this.errorMessage = 'There is an error';

    }

  }
}
