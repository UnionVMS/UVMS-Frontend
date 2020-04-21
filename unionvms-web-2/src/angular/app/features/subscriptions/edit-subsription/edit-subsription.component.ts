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
    // debugger;

    this.subscriptionFormComponent.subscriptionForm.patchValue(this.currentSubscription);
    // debugger;
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


  async checkName($event) {
    try {
      const result: any = await this.featuresService.checkNameOnEdit($event, this.currentSubscriptionId);
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
