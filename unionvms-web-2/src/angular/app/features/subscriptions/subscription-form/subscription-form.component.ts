import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { faCalendar, faRetweet } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Organization } from '../organization.model';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { Observable, Subscription } from 'rxjs';
import { FeaturesService } from 'app/features/features.service';
import { EndPoint } from '../endpoint.model';
import { CommunicationChannel } from '../communication-channel.model';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { subscriptionFormInitialValues } from '../subscriptions-helper';



@Component({
  selector: 'app-subscription-form',
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.scss']
})
export class SubscriptionFormComponent implements OnInit, OnDestroy  {
  @Input() alerts;
  @Output() save = new EventEmitter<any>();
  @Output() checkName = new EventEmitter<any>();
  endpointItems: EndPoint[] = [];
  communicationChannels: CommunicationChannel[] = [];
  faCalendar = faCalendar;
  faRetweet = faRetweet;
  subscriptionForm: FormGroup;
  messageTypes;
  organizations$: Observable<Organization[]> = this.store.select(fromRoot.getOrganizations);
  organizations: Organization[];
  historyUnits = [];
  triggerTypes = [];
  accessibilityItems = [];
  private subscription: Subscription = new Subscription();


  constructor(private fb: FormBuilder, private store: Store<fromRoot.State>,
              private featuresService: FeaturesService,  private ngbDateParserFormatter: NgbDateParserFormatter) { }

  ngOnInit(): void {
    this.initForm();
    this.initMessageTypes();
    this.setHistoryUnits();
    this.setTriggerTypes();
    this.setAccessibilityItems();
    this.subscription.add(this.organizations$.subscribe(organizations => this.organizations = organizations));
  }

  initForm() {
    this.subscriptionForm = this.fb.group({
      name: [''],  // Validators.required
      description: [''],
      accessibility: [null],
      active: [false], // Validators.required
      output: this.fb.group({
        messageType: ['NONE'],
        emails: [[]],
        hasEmail: [false],
        emailConfiguration: this.fb.group({
          body: [''],
          isPdf: [false],
          hasAttachments: [false],
          password: [''],
          passwordIsPlaceholder: [false],
          isXml: [false]
        }),
        alert: [false],
        subscriber: this.fb.group({
          organisationId: [null],
          endpointId: [{value: null, disabled: true}],
          channelId: [{value: null, disabled: true}]
        }),
        logbook: [false],
        consolidated: [false],
        vesselIds: [[]],
        generateNewReportId: [false],
        history: [1],
        historyUnit: ['DAYS']
      }),
      execution: this.fb.group({
        triggerType: ['SCHEDULER'],
        frequency: [0],
        immediate: [false],
        timeExpression: ['06:00']
      }),
      startDate: [null],
      endDate: [null]
    });

    this.initSubscriptions();
  }

  initSubscriptions() {
    // Changes for organization
    this.subscription.add(this.subscriptionForm.get('output.subscriber.organisationId').valueChanges.subscribe(value => {
      console.log('organization changed', value);
      this.onOrganizationChange(value);
    }));
    // Changes for endpoint
    this.subscription.add(this.subscriptionForm.get('output.subscriber.endpointId').valueChanges.subscribe(value => {
      console.log('end point changed', value);
      this.onEndpointChange(value);
    }));
  }

  initMessageTypes() {
    this.messageTypes = [
      { key: 'None', value: 'NONE'},
      { key: 'FA Query', value: 'FA_QUERY'},
      { key: 'FA Report', value: 'FA_REPORT'},
      { key: 'Position', value: 'POSITION'},
      { key: 'Sale Note', value: 'SALE_NOTE'}
    ];
  }

  onSubmit(event) {
    const formValues = {...this.subscriptionForm.getRawValue()};

    // Transform object for back end compatibility

     // Work with dates
    // tslint:disable-next-line: no-string-literal
    const startDateFormValue = this.subscriptionForm.controls['startDate'].value;
    if (startDateFormValue) {
      const tempStartDate = startDateFormValue.split('-').reverse().join('-');
      const startDate = `${tempStartDate}T00:00:00+01:00`;
      formValues.startDate = startDate;
    }
    // tslint:disable-next-line: no-string-literal
    const endDateFormValue = this.subscriptionForm.controls['endDate'].value;
    if (endDateFormValue) {
      const tempEndDate = endDateFormValue.split('-').reverse().join('-');
      const endDate = `${tempEndDate}T23:59:59+01:00`;
      formValues.endDate = endDate;
    }

    // TODO: perform all transformations here e.g. cast string to number for dropdowns

    // accessibilty

    const accessibilityRawValue = this.subscriptionForm.get('accessibility').value;
    // handle changing from a real value to -
    if (accessibilityRawValue === 'null') {
      formValues.accessibility = null;
    }

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
    this.save.emit(formValues);
  }

  async onOrganizationChange(value) {
    if (value === 'null' || value === null) {
      this.subscriptionForm.get('output.subscriber.endpointId').disable();
      this.subscriptionForm.get('output.subscriber.endpointId').setValue(null);
      this.subscriptionForm.get('output.subscriber.channelId').disable();
      this.subscriptionForm.get('output.subscriber.channelId').setValue(null);
      return;
    }
    if (value !== 'null') {
      const { endpoints } = await this.featuresService.getOrganizationDetails(value);
      this.endpointItems = endpoints;
      if (endpoints && this.endpointItems.length) {
        this.subscriptionForm.get('output.subscriber.endpointId').enable();
      }
    }

  }
  onEndpointChange(value) {
    if (value === 'null') {
      this.subscriptionForm.get('output.subscriber.channelId').disable();
      this.subscriptionForm.get('output.subscriber.channelId').setValue(null);
      return;
    }
    console.log(this.endpointItems);
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
      this.subscriptionForm.get('output.subscriber.channelId').enable();
    } else {
      this.subscriptionForm.get('output.subscriber.channelId').disable();
      this.subscriptionForm.get('output.subscriber.channelId').setValue(null);

    }
  }

  setHistoryUnits() {
      this.historyUnits = [
          { key: 'Days', value: 'DAYS'},
          { key: 'Weeks', value: 'WEEKS'},
          { key: 'Months', value: 'MONTHS'}
      ];
  }

  setTriggerTypes() {
    this.triggerTypes = [
      { key: 'Manual', value: 'MANUAL'},
      { key: 'Scheduler', value: 'SCHEDULER'},
      { key: 'INC FA Report', value: 'INC_FA_REPORT'},
      { key: 'INC FA Query', value: 'INC_FA_QUERY'},
      { key: 'INC Position', value: 'INC_POSITION'}
    ];
  }

  setAccessibilityItems() {
    this.accessibilityItems = [
      { key: 'Scope', value: 'SCOPE' },
      { key: 'Public', value: 'PUBLIC'}
    ];
  }

  get name() {
    return this.subscriptionForm.get('name');
  }

  onCheckName() {
    // send value for field 'name'
    // tslint:disable-next-line: no-string-literal
    const name = this.subscriptionForm.controls['name'].value;
    this.checkName.emit(name);
  }

  close(alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  reset() {
    this.subscriptionForm.reset(subscriptionFormInitialValues);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
