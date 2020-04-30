import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ApplicationRef } from '@angular/core';
import { faCalendar, faRetweet, faEye, faPlusSquare, faTrash  } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Organization } from '../organization.model';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { Observable, Subscription } from 'rxjs';
import { FeaturesService } from 'app/features/features.service';
import { EndPoint } from '../endpoint.model';
import { CommunicationChannel } from '../communication-channel.model';
import { subscriptionFormInitialValues } from '../subscriptions-helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged } from 'rxjs/operators';




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
  faEye = faEye;
  faPlusSquare = faPlusSquare;
  faTrash = faTrash;
  subscriptionForm: FormGroup;
  messageTypes;
  organizations$: Observable<Organization[]> = this.store.select(fromRoot.getOrganizations);
  organizations: Organization[];
  historyUnits = [];
  triggerTypes = [];
  accessibilityItems = [];
  private subscription: Subscription = new Subscription();

  // Please do not change order of elements
  vesselIdentifiers = ['CFR', 'IRCS', 'ICCAT', 'EXT_MARK', 'UVI'];


  constructor(private fb: FormBuilder, private store: Store<fromRoot.State>,
              private featuresService: FeaturesService,
              private modalService: NgbModal) { }

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
      name: ['', Validators.required ],
      description: [''],
      accessibility: [null],
      active: [false],
      output: this.fb.group({
        messageType: ['NONE'],
        emails: this.fb.array([]),
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
        logbook: [{value: false, disabled: true}],
        consolidated: [{value: true, disabled: true}],
        vesselIds: this.fb.array(this.vesselIdentifiers),
        generateNewReportId: [{value: false, disabled: true}],
        history: [{value: 1, disabled: true}],
        historyUnit: [{value: 'DAYS', disabled: true}]
      }),
      execution: this.fb.group({
        triggerType: ['SCHEDULER'],
        frequency: [0, Validators.required],
        immediate: [true],
        timeExpression: ['06:00', Validators.required]
      }),
      startDate: [null],
      endDate: [null],
      hasAreas: [true]
    });

    this.initSubscriptions();
  }

  get emails() {
    return this.subscriptionForm.get('output.emails') as FormArray;
  }

  get name() {
    return this.subscriptionForm.get('name');
  }

  get organisationId() {
    return this.subscriptionForm.get('output.subscriber.organisationId');
  }

  get endpointId() {
    return this.subscriptionForm.get('output.subscriber.endpointId');
  }

  get channelId() {
    return this.subscriptionForm.get('output.subscriber.channelId');
  }

  get passwordIsPlaceholder() {
    return this.subscriptionForm.get('output.emailConfiguration.passwordIsPlaceholder');
  }

  get body() {
    return this.subscriptionForm.get('output.emailConfiguration.body');
  }

  get logbook() {
    return this.subscriptionForm.get('output.logbook');
  }

  get consolidated() {
    return this.subscriptionForm.get('output.consolidated');
  }

  get history() {
    return this.subscriptionForm.get('output.history');
  }

  get historyUnit() {
    return this.subscriptionForm.get('output.historyUnit');
  }

  get generateNewReportId() {
    return this.subscriptionForm.get('output.generateNewReportId');
  }

  get frequency() {
    return this.subscriptionForm.get('execution.frequency');
  }

  get timeExpression() {
    return this.subscriptionForm.get('execution.timeExpression');
  }

  get triggerType() {
    return this.subscriptionForm.get('execution.triggerType');
  }

  get hasAreas() {
    return this.subscriptionForm.get('hasAreas');
  }

  initSubscriptions() {
    // Changes for organization
    this.subscription.add(this.subscriptionForm.get('output.subscriber.organisationId').valueChanges
    .pipe(distinctUntilChanged())
    .subscribe(value => {
      console.log('organization changed', value);
      this.onOrganizationChange(value);
    }));
    // Changes for endpoint
    this.subscription.add(this.subscriptionForm.get('output.subscriber.endpointId').valueChanges
    .subscribe(value => {
      console.log('end point changed', value);
      this.onEndpointChange(value);
    }));
    this.subscription.add(this.subscriptionForm.get('output.messageType').valueChanges
    .subscribe(value => {
      console.log('message type changed', value);
      this.onMessageTypeChange(value);
    }));
    this.subscription.add(this.subscriptionForm.get('output.hasEmail').valueChanges
    .pipe(distinctUntilChanged())
    .subscribe(value => {
      console.log('has email changed', value);
      this.onHasEmailChange(value);
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

    // Perform all transformations here e.g. cast string to number for dropdowns

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

  /*vessel Identifiers. By default we get the state of each checkbox aka checked/ not checked.
    We need to transform values for back-end
  */
    const validVesselIdIndices = this.subscriptionForm.get('output.vesselIds').value.reduce( (acc, current, i) => {
      if (current === true) {
          acc.push(i);
      }
      return acc;
    }, []);
    const vesselIdsArray = [];

    validVesselIdIndices.forEach(index => {
      vesselIdsArray.push(this.vesselIdentifiers[index]);
    });
    formValues.output.vesselIds = vesselIdsArray;

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

  addEmail(content) {
    console.log('add');
    this.modalService.open(content).result.then((result) => {
      if (result.emails) {
        const formattedEmailArray = result.emails.split(';');
        formattedEmailArray.forEach(item => {
          this.emails.push(new FormControl(item));
        });
      }
    }, (reason) => {

    });
    this.subscriptionForm.updateValueAndValidity();
  }

  removeEmail(index) {
    this.emails.removeAt(index);
    console.log(index);

  }
  onMessageTypeChange(value) {
    // Message configuration fields (except identifiers) should only be available for FA_REPORT and FA_QUERY
    const messageConfigurationEnabledFor = ['FA_REPORT', 'FA_QUERY'];
    if (!messageConfigurationEnabledFor.includes(value)) {
        this.logbook.disable();
        this.consolidated.disable();
        this.generateNewReportId.disable();
        this.history.disable();
        this.history.clearValidators();
        this.history.updateValueAndValidity();
        this.historyUnit.disable();
    } else {
        this.logbook.enable();
        this.consolidated.enable();
        this.generateNewReportId.enable();
        this.history.enable();
        this.history.setValidators([Validators.required]);
        this.history.updateValueAndValidity();
        this.historyUnit.enable();

    }
    // Subscriber details required for all types except NONE
    const subscriberRequiredFor = ['FA_REPORT', 'FA_QUERY', 'POSITION', 'SALE_NOTE'];
    if (subscriberRequiredFor.includes(value)) {
      this.organisationId.setValidators([Validators.required]);
      // TODO: search if we can update value and validity for the whole form group
      this.organisationId.updateValueAndValidity();
      this.endpointId.setValidators([Validators.required]);
      this.endpointId.updateValueAndValidity();
      this.channelId.setValidators([Validators.required]);
      this.channelId.updateValueAndValidity();

    } else {
     // Remove validators
      this.organisationId.clearValidators();
      this.organisationId.updateValueAndValidity();
      this.endpointId.clearValidators();
      this.endpointId.updateValueAndValidity();
      this.channelId.clearValidators();
      this.channelId.updateValueAndValidity();
    }
  }

  onPasswordChange() {
    this.passwordIsPlaceholder.setValue(false);
  }

  onHasEmailChange(value) {
    if (value) {
      this.body.setValidators([Validators.required]);
      this.body.updateValueAndValidity();
    } else {
      this.body.clearValidators();
      this.body.updateValueAndValidity();
    }
  }

  onTriggerTypeChange() {
    const triggerType = this.triggerType.value;
    if (triggerType === 'SCHEDULER') {
        this.frequency.setValidators([Validators.required]);
        this.frequency.updateValueAndValidity();
        this.timeExpression.setValidators([Validators.required]);
        this.timeExpression.updateValueAndValidity();
    } else {
      this.frequency.clearValidators();
      this.frequency.updateValueAndValidity();
      this.timeExpression.clearValidators();
      this.timeExpression.updateValueAndValidity();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
