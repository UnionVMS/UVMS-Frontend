import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SubscriptionFormModel } from '../subscription-form.model';
import { FeaturesService } from '../../features.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionFormComponent } from '../subscription-form/subscription-form.component';

interface Alert {
  type: string;
  message: string;
}


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
  alerts: Alert[];

  constructor(private featuresService: FeaturesService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.currentSubscriptionId = +this.activatedRoute.snapshot.paramMap.get('id');
  }

  async ngAfterViewInit() {
    const result = await this.featuresService.getSubscriptionDetails(this.currentSubscriptionId);
    this.currentSubscription = result.data;


    this.subscriptionFormComponent.subscriptionForm.patchValue(this.currentSubscription);


    // bind dates
    const rawStartDateTime = this.currentSubscription.startDate;
    const rawEndDateTime = this.currentSubscription.endDate;

    const startDate = rawStartDateTime.split('T');
    const endDate = rawEndDateTime.split('T');
    const tempStartDate = startDate[0].split('-').reverse().join('-');
    const tempEndDate = endDate[0].split('-').reverse().join('-');


    this.subscriptionFormComponent.subscriptionForm.get('startDate').setValue(tempStartDate);
    this.subscriptionFormComponent.subscriptionForm.get('endDate').setValue(tempEndDate);

    this.subscriptionFormComponent.subscriptionForm.updateValueAndValidity();
  }


  async editSubscription($event) {
    console.log('edit');
    try {
      const result = this.featuresService.editSubscription($event, this.currentSubscriptionId);
      // TODO: bind new values to form
      this.alerts = [];
      this.alerts.push({
        type: 'success',
        message: 'Subscription successfuly updated!'
      });

    } catch (err) {
      this.alerts = [];
      this.alerts.push({
        type: 'danger',
        message: err.error.msg
      });

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
    }

  }
}
