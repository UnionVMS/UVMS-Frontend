import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { faCalendar, faRetweet, faEye, faPlusSquare, faTrash, faAngleRight  } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Organisation } from '../organisation.model';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { Observable, Subscription } from 'rxjs';
import { FeaturesService } from 'app/features/features.service';
import { EndPoint } from '../endpoint.model';
import { CommunicationChannel } from '../communication-channel.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged } from 'rxjs/operators';
import { StatusAction } from '../subscriptions.reducer';
import { Router } from '@angular/router';
import { SubscriptionSubscriberDto } from 'app/features/features.model';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

interface SenderElement {
  type: string;
  displayName: string;
  value: SubscriptionSubscriberDto;
}

// Message configuration fields (except identifiers) should only be available for FA_REPORT and FA_QUERY
const MESSAGE_CONFIG_ENABLED_FOR = ['FA_REPORT', 'FA_QUERY'];

// Vessel identifiers should be available for FA_REPORT, FA_QUERY and POSITION
const VESSEL_IDS_ENABLED_FOR = ['FA_REPORT', 'FA_QUERY', 'POSITION'];

// Subscriber details required for all types except NONE
const SUBSCRIBER_REQUIRED_FOR = ['FA_REPORT', 'FA_QUERY', 'POSITION', 'SALE_NOTE'];

@Component({
  selector: 'app-subscription-form',
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.scss']
})
export class SubscriptionFormComponent implements OnInit, OnDestroy {
  @Input() alerts;
  @Input() mode;
  @Output() save = new EventEmitter<any>();
  @Output() checkName = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  endpointItems: EndPoint[] = [];
  communicationChannels: CommunicationChannel[] = [];
  faCalendar = faCalendar;
  faRetweet = faRetweet;
  faEye = faEye;
  faPlusSquare = faPlusSquare;
  faTrash = faTrash;
  subscriptionForm: FormGroup;
  messageTypes;
  organisations$: Observable<Organisation[]> = this.store.select(fromRoot.getOrganisations);
  organisations: Organisation[];
  historyUnits = [];
  frequencyUnits = [];
  triggerTypes = [];
  deadlineUnits = [];
  numberOfSelectedAreas = 0;
  numberOfSelectedAssets = 0;
  isCollapsed = true;
  isAssetsCollapsed = true;
  isChecked = false;
  fieldType;
  activitiesList;
  timedAlertClosed = false;
  private subscription: Subscription = new Subscription();
  isCollapsed$: Observable<StatusAction> = this.store.select(fromRoot.toggleSubscriptionAreasSection);
  timedAlertClosed$: Observable<any> = this.store.select(fromRoot.closeTimedAlert);
  allSenders: SenderElement[];

  // Please do not change order of elements
  vesselIdentifiers = ['CFR', 'IRCS', 'ICCAT', 'EXT_MARK', 'UVI'];
  selectedItems: Array<any> = [];
  dropdownSettings: IDropdownSettings = {};

  constructor(private fb: FormBuilder, private store: Store<fromRoot.State>,
              private featuresService: FeaturesService,
              private modalService: NgbModal, private router: Router) { }

  ngOnInit(): void {
    this.initForm();
    this.initMessageTypes();
    this.setHistoryUnits();
    this.setFrequencyUnits();
    this.setTriggerTypes();
    this.setDeadlineUnits();
    this.getActivities();
    this.fetchAllSenders();
    this.subscription.add(this.organisations$.subscribe(organisations => this.organisations = organisations));
    this.subscription.add(this.isCollapsed$.subscribe( collapsed => {
      this.isCollapsed = collapsed.status;
      this.isAssetsCollapsed = collapsed.status;
    }));

    this.subscription.add(this.timedAlertClosed$.subscribe(close => {
      if (close) {
        this.closeTimedAlert();
      } else {
        this.timedAlertClosed = false;
      }
    }));
    this.selectedItems = ['CFR', 'IRCS', 'ICCAT', 'EXT_MARK', 'UVI'];
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 5,
    };
  }

  initForm() {
    this.resetEmailBodyToDefault();
    this.subscriptionForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      active: [false],
      output: this.fb.group({
        messageType: ['NONE'],
        emails: this.fb.array([]),
        hasEmail: [false],
        emailConfiguration: this.fb.group({
          body: [''],
          isPdf: [{value: false, disabled: true}],
          zipAttachments: [false],
          password: [''],
          passwordIsPlaceholder: [false],
          isXml: [false]
        }),
        alert: [{value: false, disabled: true}],
        subscriber: this.fb.group({
          organisationId: [null],
          endpointId: [{value: null, disabled: true}],
          channelId: [{value: null, disabled: true}]
        }),
        logbook: [{value: false, disabled: true}],
        consolidated: [{value: true, disabled: true}],
        vesselIds: [{value: this.selectedItems, disabled: true}],
        generateNewReportId: [{value: false, disabled: true}],
        history: [{value: 1, disabled: true}, [Validators.min(0), Validators.max(9999)]],
        historyUnit: [{value: 'DAYS', disabled: true}]
      }),
      execution: this.fb.group({
        triggerType: ['SCHEDULER'],
        frequency: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
        frequencyUnit: ['DAYS'],
        immediate: [true],
        timeExpression: ['06:00', [Validators.required, Validators.pattern(/^(?:23|22|21|20|[01]?[0-9]):[0-5][0-9]$/)]]
      }),
      startDate: [null],
      endDate: [null],
      areas: this.fb.array([]),
      assets: this.fb.array([]),
      deadline: [0, [Validators.min(0), Validators.max(9999)]],
      deadlineUnit: ['DAYS'],
      stopWhenQuitArea: [true],
      stopActivities: this.fb.array([]),
      startActivities: this.fb.array([]),
      senders: this.fb.control([])
    });

    this.initSubscriptions();
  }

  get emails() {
    return this.subscriptionForm.get('output.emails') as FormArray;
  }

  get hasEmail() {
    return this.subscriptionForm.get('output.hasEmail');
  }

  get name() {
    return this.subscriptionForm.get('name');
  }

  get messageType() {
    return this.subscriptionForm.get('output.messageType');
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

  get vesselIds() {
    return this.subscriptionForm.get('output.vesselIds');
  }

  get frequency() {
    return this.subscriptionForm.get('execution.frequency');
  }

  get frequencyUnit() {
    return this.subscriptionForm.get('execution.frequencyUnit');
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
  get areas() {
    return this.subscriptionForm.get('areas') as FormArray;
  }
  get assets() {
    return this.subscriptionForm.get('assets') as FormArray;
  }

  get stopActivities() {
    return this.subscriptionForm.get('stopActivities') as FormArray;
  }
  get startActivities() {
    return this.subscriptionForm.get('startActivities') as FormArray;
  }

  get alert() {
    return this.subscriptionForm.get('output.alert')
  }

  private initSubscriptions() {
    // Changes for organisation
    this.subscription.add(this.subscriptionForm.get('output.subscriber.organisationId').valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(value => this.onOrganisationChange(value))
    );
    // Changes for endpoint
    this.subscription.add(this.subscriptionForm.get('output.subscriber.endpointId').valueChanges
      .subscribe(value => this.onEndpointChange(value)));
    this.subscription.add(this.subscriptionForm.get('output.messageType').valueChanges
      .subscribe(value => this.onMessageTypeChange(value)));
    this.subscription.add(this.subscriptionForm.get('output.hasEmail').valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(value => this.onHasEmailChange(value))
    );
    this.subscription.add(this.subscriptionForm.get('output.logbook').valueChanges
      .subscribe(value => this.onLogbookChange(value)));
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

    /* organisationId, endPointId, channelId
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

    // Remove name property from each area
    formValues.areas.forEach(element => {
      delete element.name;
    });
    this.save.emit(formValues);
  }

  async onOrganisationChange(value) {
    if (value === 'null' || value === null) {
      this.subscriptionForm.get('output.subscriber.endpointId').disable();
      this.subscriptionForm.get('output.subscriber.endpointId').setValue(null);
      this.subscriptionForm.get('output.subscriber.channelId').disable();
      this.subscriptionForm.get('output.subscriber.channelId').setValue(null);
      return;
    }
    if (value !== 'null') {
      const { endpoints } = await this.featuresService.getOrganisationDetails(value);
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

  setFrequencyUnits() {
    this.frequencyUnits = [
      { key: 'Days', value: 'DAYS'},
      { key: 'Weeks', value: 'WEEKS'},
      { key: 'Months', value: 'MONTHS'}
    ];
  }

  setDeadlineUnits() {
    this.deadlineUnits = [
      { key: 'Days', value: 'DAYS'},
      { key: 'Weeks', value: 'WEEKS'},
      { key: 'Months', value: 'MONTHS'}
    ];
  }

  setTriggerTypes() {
    this.triggerTypes = [
      { key: 'Scheduler', value: 'SCHEDULER'},
      { key: 'INC FA Report', value: 'INC_FA_REPORT'},
      { key: 'INC FA Query', value: 'INC_FA_QUERY'},
      { key: 'INC Position', value: 'INC_POSITION'}
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

  closeTimedAlert() {
    setTimeout(() => this.timedAlertClosed = true, 5000);
  }

  reset() {
    this.router.navigate(['subscriptions/manage-subscriptions']);
  }

  addEmail(content) {
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
  }

  private onMessageTypeChange(value) {
    if (!MESSAGE_CONFIG_ENABLED_FOR.includes(value)) {
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

    this.vesselIds[VESSEL_IDS_ENABLED_FOR.includes(value) ? 'enable' : 'disable']();

    if (SUBSCRIBER_REQUIRED_FOR.includes(value)) {
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

  private onHasEmailChange(value) {
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

    if (triggerType !== 'INC_POSITION') {
      this.alert.setValue(false);
      this.alert.disable();
    } else {
      this.alert.enable();
    }
  }

  onSelectedAreasChange(numberOfSelectedAreas) {
    this.numberOfSelectedAreas = numberOfSelectedAreas;
  }

  onSelectedAssetsChange(numberOfSelectedAssets) {
    this.numberOfSelectedAssets = numberOfSelectedAssets;
  }

  togglePassword() {
    this.fieldType = !this.fieldType;
  }

  deleteSubscription() {
    this.delete.emit();
  }

  async getActivities() {
      try {
        // Back end service expects an object of a particular form
        const searchObj = {
          pagination: {
            offset: 0,
            pageSize: 25
          },
          sorting: {
            sortBy: 'code',
            isReversed: true
          },
          criteria: {
            acronym: 'FLUX_FA_TYPE',
            filter: '*',
            searchAttribute: [
              'code',
              'description',
              'version'
            ]
          }
        };
        // contains data for each fishing activity including code
        const result = await this.featuresService.getFishingActivitiesMasterData(searchObj);

        // get code for each fishing activity and construct a new array containing all activities per type
        this.activitiesList = result.resultList.reduce((acc, next) => {
          acc.push(
            {
              type: 'NOTIFICATION',
              value: next.code
            },
            {
              type: 'DECLARATION',
              value: next.code
            });
          return acc;
        }, []);
      } catch (err) {
      }
  }

  onChangeActivity(activity, status, type) {
    if (!this[type].length) {
      this[type].push(new FormControl(activity));
    } else {
      const diff = this[type].value.findIndex(element => element.type === activity.type && element.value === activity.value);
      if (status && diff === -1) {
        this[type].push(new FormControl(activity));
      } else if (!status && diff > -1) {
        this[type].removeAt(diff);
      }
    }
  }

  getIsChecked(activity, type) {
    if (!this[type].value.length) {
      return false;
    } else {
      // check if entry exists in stopActivities form array
      return this[type].value.some(item => item.type === activity.type &&  item.value === activity.value);
    }
  }

  private async fetchAllSenders() {
    this.featuresService.fetchAllSenders()
      .then(resp => {
        this.allSenders = resp.data.reduce((aggr, organisation) => {
          return aggr.concat((organisation.endPointList || []).reduce((epAggr, endpoint) => {
            return epAggr.concat((endpoint.channel || []).map(channel => ({
              type: organisation.isoa3code,
              displayName: endpoint.name + ' - ' + channel.dataflow,
              value: {
                organisationId: organisation.organisationId,
                endpointId: endpoint.endPointId,
                channelId: channel.channelId
              }
            })));
          }, [] as SenderElement[]));
        }, [] as SenderElement[]);
      });
  }

  resetEmailBodyToDefault() {
    this.featuresService.fetchDefaultEmailBody()
      .then(resp => this.body.setValue(resp.data));
  }

  private onLogbookChange(value: boolean) {
    if (!!value) {
      this.subscriptionForm.get('output.emailConfiguration.isPdf').enable();
    } else {
      this.subscriptionForm.get('output.emailConfiguration.isPdf').setValue(false);
      this.subscriptionForm.get('output.emailConfiguration.isPdf').disable();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
