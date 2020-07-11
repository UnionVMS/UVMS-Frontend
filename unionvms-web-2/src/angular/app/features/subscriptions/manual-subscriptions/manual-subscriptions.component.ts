import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FeaturesService } from '../../features.service';
import { faCalendar  } from '@fortawesome/free-solid-svg-icons';
import { Organization } from '../organization.model';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { EndPoint } from '../endpoint.model';
import { CommunicationChannel } from '../communication-channel.model';
import {  IDropdownSettings } from 'ng-multiselect-dropdown';
import { Alert } from 'app/shared/alert.model';
import { manualSubscriptionsInitialFormValues } from '../subscriptions-helper';



@Component({
  selector: 'app-manual-subscriptions',
  templateUrl: './manual-subscriptions.component.html',
  styleUrls: ['./manual-subscriptions.component.scss']
})
export class ManualSubscriptionsComponent implements OnInit, OnDestroy {
  isAssetsCollapsed = true;
  isAreasCollapsed = true;
  manualSubscriptionForm: FormGroup;
  messageTypes;
  faCalendar = faCalendar;
  queryControl: FormControl;
  historyUnits = [];
  numberOfSelectedAssets;
  numberOfSelectedAreas;
  organizations$: Observable<Organization[]> = this.store.select(fromRoot.getOrganizations);
  organizations: Organization[];
  private subscription: Subscription = new Subscription();
  endpointItems: EndPoint[] = [];
  communicationChannels: CommunicationChannel[] = [];


  disabled = false;
  limitSelection = false;
  vesselIdsList: Array<any> = [];
  selectedItems: Array<any> = [];
  dropdownSettings: IDropdownSettings = {};
  alerts: Alert[];
  inputsDisabled = false;


  get history() {
    return this.manualSubscriptionForm.get('output.history');
  }
  get historyUnit() {
    return this.manualSubscriptionForm.get('output.historyUnit');
  }

  get vesselIds() {
    return this.manualSubscriptionForm.get('output.vesselIds') as FormArray;
  }

  get queryStartDate() {
    return this.manualSubscriptionForm.get('output.queryStartDate');
  }

  get queryEndDate() {
    return this.manualSubscriptionForm.get('output.queryEndDate');
  }

  get organisationId() {
    return this.manualSubscriptionForm.get('output.subscriber.organisationId');
  }

  get endpointId() {
    return this.manualSubscriptionForm.get('output.subscriber.endpointId');
  }

  get channelId() {
    return this.manualSubscriptionForm.get('output.subscriber.channelId');
  }

  get assets() {
    return this.manualSubscriptionForm.get('assets') as FormArray;
  }

  get areas() {
    return this.manualSubscriptionForm.get('areas') as FormArray;
  }

  constructor(private fb: FormBuilder, private featuresService: FeaturesService, private store: Store<fromRoot.State>) { }

  ngOnInit(): void {

    this.initMessageTypes();
    this.setHistoryUnits();
    this.subscription.add(this.organizations$.subscribe(organizations => this.organizations = organizations));

    this.vesselIdsList =  ['CFR', 'IRCS', 'ICCAT', 'EXT_MARK', 'UVI'];
    this.selectedItems = ['CFR', 'IRCS', 'ICCAT', 'EXT_MARK', 'UVI'];
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 5,
    };
    this.initForm();
  }

  initForm() {
    this.queryControl = this.fb.control('period');
    this.manualSubscriptionForm = this.fb.group({
      output: this.fb.group({
        messageType: ['FA_QUERY'],
        subscriber: this.fb.group({
          organisationId: ['', Validators.required],
          endpointId: [{value: '', disabled: true}, Validators.required],
          channelId: [{value: '', disabled: true}, Validators.required]
        }),
        consolidated: [true],
        vesselIds: [this.selectedItems, Validators.required],
        queryStartDate: [null, Validators.required],
        queryEndDate: [null, Validators.required],
        history: [{value: null, disabled: true}, [Validators.required, Validators.min(1), Validators.max(9999)]],
        historyUnit: [{value: null, disabled: true}, Validators.required]
      }),
      areas: this.fb.array([]),
      assets: this.fb.array([]),
    });
    this.subscription.add(this.queryControl.valueChanges.subscribe(this.onQuerySelectionChange.bind(this)));
    this.initSubscriptions();
  }

  initMessageTypes() {
    this.messageTypes = [
      { key: 'FA Query', value: 'FA_QUERY'},
    ];
  }

  setHistoryUnits() {
    this.historyUnits = [
      { key: 'Hours', value: 'HOURS'},
      { key: 'Days', value: 'DAYS'},
      { key: 'Weeks', value: 'WEEKS'},
      { key: 'Months', value: 'MONTHS'}
    ];
  }

  async onSubmit() {
    const formValues = {...this.manualSubscriptionForm.getRawValue()};
     // Transform object for back end compatibility

     // Work with dates
    const startDateFormValue = this.manualSubscriptionForm.get('output.queryStartDate').value;
    if (startDateFormValue) {
      const tempStartDate = startDateFormValue.split('-').reverse().join('-');
      const startDate = `${tempStartDate}T00:00:00+01:00`;
      formValues.output.queryStartDate = startDate;
    }
    const endDateFormValue = this.manualSubscriptionForm.get('output.queryEndDate').value;
    if (endDateFormValue) {
      const tempEndDate = endDateFormValue.split('-').reverse().join('-');
      const endDate = `${tempEndDate}T23:59:59+01:00`;
      formValues.output.queryEndDate = endDate;
    }

    // Perform all transformations here e.g. cast string to number for dropdowns

    /* organizationId, endPointId, channelId
    * By default select returns a string but we need to cast it to a number for back-end
    */

    const matchArray = ['organisationId', 'endpointId', 'channelId'];
    for (const [key, value] of Object.entries(formValues.output.subscriber)) {
     if (matchArray.includes(key)) {
       if (value !== null) {
         formValues.output.subscriber[key] = Number(value);
       }
      }
   }

   // Cases where we would expect null but select by default returns 'null' for subscriber field group
    for (const [key, value] of Object.entries(formValues.output.subscriber)) {
      if (matchArray.includes(key)) {
        if (value === 'null') {
          formValues.output.subscriber[key] = null;
        }
      }
    }
    try {
      const result = await this.featuresService.createManualSubscription(formValues);
      this.alerts = [];
      this.alerts.push({
        type: 'success',
        title: 'Success',
        body: [{
            message: 'Subscription Successfully saved!'
        }]
      });

      this.manualSubscriptionForm.disable();
      this.inputsDisabled = true;
      this.queryControl.disable();

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

  onQuerySelectionChange(value) {
    if (this.inputsDisabled) {
      return;
    }
    if (value === 'period') {
      this.history.setValue(null);
      this.history.disable();
      this.historyUnit.setValue(null);
      this.historyUnit.disable();
      this.queryStartDate.enable();
      this.queryEndDate.enable();
    } else {
      this.queryStartDate.setValue(null);
      this.queryStartDate.disable();
      this.queryEndDate.setValue(null);
      this.queryEndDate.disable();
      this.history.enable();
      this.historyUnit.enable();
    }
  }

  initSubscriptions() {
    // Changes for organization
    this.subscription.add(this.manualSubscriptionForm.get('output.subscriber.organisationId').valueChanges
    .pipe(distinctUntilChanged())
    .subscribe(value => {
      this.onOrganizationChange(value);
    }));
    // Changes for endpoint
    this.subscription.add(this.manualSubscriptionForm.get('output.subscriber.endpointId').valueChanges
    .subscribe(value => {
      this.onEndpointChange(value);
    }));
  }

  async onOrganizationChange(value) {
    if (value === 'null' || value === '') {
      this.manualSubscriptionForm.get('output.subscriber.endpointId').disable();
      this.manualSubscriptionForm.get('output.subscriber.endpointId').setValue('');
      this.manualSubscriptionForm.get('output.subscriber.channelId').disable();
      this.manualSubscriptionForm.get('output.subscriber.channelId').setValue('');
      return;
    }
    if (value !== 'null') {
      const { endpoints } = await this.featuresService.getOrganizationDetails(value);
      this.endpointItems = endpoints;
      if (endpoints && this.endpointItems.length) {
        this.manualSubscriptionForm.get('output.subscriber.endpointId').enable();
      }
    }
  }

  onEndpointChange(value) {
    if (value === '') {
      this.manualSubscriptionForm.get('output.subscriber.channelId').disable();
      this.manualSubscriptionForm.get('output.subscriber.channelId').setValue('');
      return;
    }
    let matchingEndpoint = [];
    if (this.endpointItems && this.endpointItems.length) {
      matchingEndpoint = this.endpointItems.filter(item => {
        return item.endpointId === +value;
      });
    }
    if (matchingEndpoint.length) {
       // Assuming there will always be only one matching endpoint
      this.communicationChannels = matchingEndpoint[0].channelList;
    }
    if (this.communicationChannels.length) {
      this.manualSubscriptionForm.get('output.subscriber.channelId').enable();
    } else {
      this.manualSubscriptionForm.get('output.subscriber.channelId').disable();
      this.manualSubscriptionForm.get('output.subscriber.channelId').setValue('');
    }
  }

  onSelectedAssetsChange(numberOfSelectedAssets) {
    this.numberOfSelectedAssets = numberOfSelectedAssets;
  }

  onSelectedAreasChange(numberOfSelectedAreas) {
    this.numberOfSelectedAreas = numberOfSelectedAreas;
  }

  close(alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  cancel() {
    this.manualSubscriptionForm.reset(manualSubscriptionsInitialFormValues);
    this.areas.clear();
    this.assets.clear();

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
