import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SubscriptionFormModel } from '../subscription-form.model';
import { FeaturesService } from '../../features.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionFormComponent } from '../subscription-form/subscription-form.component';
import { FormArray, FormControl } from '@angular/forms';

interface Alert {
  type: string;
  title: string;
  body: object[];
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
  // Please do not change order of elements
  vesselIdentifiers = ['CFR', 'IRCS', 'ICCAT', 'EXT_MARK', 'UVI'];
  mode = 'Edit';


  constructor(private featuresService: FeaturesService, private activatedRoute: ActivatedRoute) { }

  // TODO: Areas and Emails need to be 'refreshed' when showing and updating results. Create a function to handle refreshing
  // and use it on ngAfterViewInit and on editSubscription since code is repeated

  ngOnInit(): void {
    this.currentSubscriptionId = +this.activatedRoute.snapshot.paramMap.get('id');
  }

  async ngAfterViewInit() {
    const result = await this.featuresService.getSubscriptionDetails(this.currentSubscriptionId);
    this.currentSubscription = result.data;
    // Areas
    if (this.currentSubscription.areas.length) {
      const areaProperties = await this.getAreaProperties(result.data.areas);

      const temp = [...this.currentSubscription.areas];

      temp.forEach(item => {
        const match = areaProperties.find(element => element.gid === item.gid && element.areaType === item.areaType);
        item.name = match.name;
      });

      const areasFormArray = this.subscriptionFormComponent.subscriptionForm.get('areas') as FormArray;

      temp.forEach(item => {
        areasFormArray.push(new FormControl(item));
      });
    }

    // Work with emails formArray
    const emailFormArray = this.subscriptionFormComponent.subscriptionForm.get('output.emails') as FormArray;
    this.currentSubscription.output.emails.forEach(item => {
      emailFormArray.push(new FormControl(item));
    });


    this.subscriptionFormComponent.subscriptionForm.patchValue(this.currentSubscription);
    // bind dates
    const rawStartDateTime = this.currentSubscription.startDate;
    const rawEndDateTime = this.currentSubscription.endDate;
    if (rawStartDateTime) {
      const startDate = rawStartDateTime.split('T');
      const tempStartDate = startDate[0].split('-').reverse().join('-');
      this.subscriptionFormComponent.subscriptionForm.get('startDate').setValue(tempStartDate);
    }

    if (rawEndDateTime) {
      const endDate = rawEndDateTime.split('T');
      const tempEndDate = endDate[0].split('-').reverse().join('-');
      this.subscriptionFormComponent.subscriptionForm.get('endDate').setValue(tempEndDate);
    }

    /*vesselIds array. Back end returns an array of strings but checkbox expects state
    for it to be checked or not. Transform.
    */
    const vesselIdsRawValue = this.currentSubscription.output.vesselIds;

    let transformedVesselIdsArray = [];

    if (vesselIdsRawValue.length) {
     this.vesselIdentifiers.forEach(item => {
        const hasIdentifier = vesselIdsRawValue.includes(item);
        transformedVesselIdsArray.push(hasIdentifier);
     });
    } else {
      // initialise array with false values, reactive form throws and error otherwise
      transformedVesselIdsArray = [false, false, false, false, false];
    }

    this.subscriptionFormComponent.subscriptionForm.get('output.vesselIds').setValue(transformedVesselIdsArray);

    this.subscriptionFormComponent.subscriptionForm.updateValueAndValidity();
  }


  async editSubscription($event) {
    try {
      const result: any = await this.featuresService.editSubscription($event, this.currentSubscriptionId);
      // TODO: bind new values to form

      // Show updated areas
      const areasFormArray = this.subscriptionFormComponent.subscriptionForm.get('areas') as FormArray;
      areasFormArray.clear();

      if (result.data.areas.length) {
        const areaProperties = await this.getAreaProperties(result.data.areas);
        const temp = [...result.data.areas];

        temp.forEach(item => {
          const match = areaProperties.find(element => element.gid === item.gid && element.areaType === item.areaType);
          item.name = match.name;
        });
        temp.forEach(item => {
          areasFormArray.push(new FormControl(item));
        });
      }
      // Show updated emails
      const emailsFormArray = this.subscriptionFormComponent.subscriptionForm.get('output.emails') as FormArray;
      emailsFormArray.clear();

      if (result.data.output.emails.length) {
        const tempEmails = [...result.data.output.emails];
        tempEmails.forEach(item => {
            emailsFormArray.push(new FormControl(item));
        });
      }

      this.alerts = [];
      this.alerts.push({
        type: 'success',
        title: 'Success',
        body: [{
          message: 'Subscription Successfully updated!'
        }]
      });

    } catch (err) {
      this.alerts = [];
      this.alerts.push({
        type: 'danger',
        title: 'Subscription could not be updated',
        body: err.error.data
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


  async getAreaProperties(areas) {
    const result: any = await this.featuresService.getAreaProperties(areas);
    return result.data;
  }
}
