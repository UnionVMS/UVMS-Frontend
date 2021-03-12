import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { NameAndValue } from 'app/shared/name-and-value';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../app.reducer';
import { Observable, Subscription } from 'rxjs';
import { Organisation } from '../organisation.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EndPoint } from '../endpoint.model';
import { FeaturesService } from '../../features.service';
import { CommunicationChannel } from '../communication-channel.model';
import * as SUB from '../subscriptions.actions';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { faCheck, faTimes, faCalendar, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../confirmmodal/confirm-modal.component';
import { Subscription as SubscriptionModel } from 'app/features/subscriptions/subscription.model';
import * as moment from 'moment';
import {SubscriptionRightsService} from "../../../services/subscription-rights.service";
import {sortCommunicationChannels, sortEndpoints, sortOrganisations} from "../organisation-utils";

@Component({
  selector: 'app-manage-subscriptions',
  templateUrl: './manage-subscriptions.component.html',
  styleUrls: ['./manage-subscriptions.component.scss']
})
export class ManageSubscriptionsComponent implements OnInit, OnDestroy {
  @ViewChild('SubscriptionListTable') subscriptionListTable: any;
  canEdit: boolean = false;
  alerts;
  messageTypeItems: NameAndValue<string>[];
  triggerTypeItems: NameAndValue<string>[];
  endpointItems: EndPoint[] = [];
  communicationChannels: CommunicationChannel[] = [];
  filterSubscriptionsForm: FormGroup;
  subscriptionList: SubscriptionModel[];
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  reorderable = true;
  searchObj;
  faCheck = faCheck;
  faTimes = faTimes;
  faCalendar = faCalendar;
  faEdit = faEdit;
  faTrash = faTrash;
  count;
  sizeList;
  initialFormValues;

  organisations$: Observable<Organisation[]> = this.store.select(fromRoot.getOrganisations);
  organisations: Organisation[];
  private subscription: Subscription = new Subscription();

  constructor(private store: Store<fromRoot.State>, private featuresService: FeaturesService, private fb: FormBuilder,
              private router: Router, private modalService: NgbModal, subscriptionRightsService: SubscriptionRightsService) {

    subscriptionRightsService.canEdit().then(canEdit => {
      this.canEdit = canEdit;
    });

    this.sizeList = [
      '10',
      '20',
      '50'
    ];

    this.initialFormValues = {
      name: '',
      active: null,
      organisation: null,
      endpoint: null,
      description: '',
      startDate: null,
      endDate: null,
      channel: null,
      messageType: null,
      withAnyTriggerType: null,
      alert: null
    };
  }

  ngOnInit(): void {
    this.initMessageTypeItems();
    this.initTriggerTypeItems();
    this.subscription.add(this.organisations$.subscribe(organisations => {
      this.organisations = organisations;
      sortOrganisations(this.organisations);
    }));

    this.initForm();
    this.searchObj = {
      pagination: {
          offset: 0,
          pageSize: 10
      },
      criteria: this.filterSubscriptionsForm.getRawValue(),
      orderBy: {
        direction: 'ASC',
        field: 'ID'
      }
    };

    this.fetchSubscriptionsList();
  }

  initForm() {
    this.filterSubscriptionsForm = this.fb.group({
      name: [''],
      active: [null],
      organisation: [null],
      endpoint: [{value: null, disabled: true}],
      description: [''],
      startDate: [null],
      endDate: [null],
      channel: [{value: null, disabled: true}],
      messageType: [null],
      withAnyTriggerType: [null],
      alert: [null]
    });


    this.subscription.add(this.filterSubscriptionsForm.get('organisation').valueChanges.subscribe(value => {
      this.onOrganisationChange(value);
    }));

    this.subscription.add(this.filterSubscriptionsForm.get('endpoint').valueChanges.subscribe(value => {
      this.onEndpointChange(value);
    }));
  }

  private initMessageTypeItems() {
    this.messageTypeItems = [
      { name: 'None', value: 'NONE'},
      { name: 'FA Report', value: 'FA_REPORT'},
      { name: 'FA Query', value: 'FA_QUERY'},
      { name: 'Position', value: 'POSITION'},
      { name: 'Sale Note', value: 'SALE_NOTE'},
    ];
  }

  private initTriggerTypeItems() {
    this.triggerTypeItems = [
      { name: 'Scheduler', value: 'SCHEDULER' },
      { name: 'INC FA Report', value: 'INC_FA_REPORT' },
      { name: 'INC FA Query', value: 'INC_FA_QUERY' },
      { name: 'INC Position', value: 'INC_POSITION' }
    ];
  }

  onSubmit() {
    // Reset pagination on every search
    this.searchObj.pagination.offset = 0;
    const formValues = {...this.filterSubscriptionsForm.getRawValue()};

    const matchArray = ['endpoint', 'organisation', 'channel'];
    // for endpoint, organisation, comm. channel if they exist in formValues
    // cast string to number as select returns a string but back end expects number
    for (const [key, value] of Object.entries(formValues)) {
      if (matchArray.includes(key)) {
        if (value !== null) {
          formValues[key] = Number(value);
        }
      }
    }
    // Cases where we would expect null but select by default returns 'null'
    for (const [key, value] of Object.entries(formValues)) {
      if (value === 'null') {
        formValues[key] = null;
      }
    }
    // override initial values
    this.searchObj.criteria = formValues;

    // Work with dates, ng datepicker returns a NgbDateStruct which we manually need to format

    // tslint:disable-next-line: no-string-literal
    const startDateFormValue = this.filterSubscriptionsForm.controls['startDate'].value;
    if (startDateFormValue) {
      const tempStartDate = startDateFormValue.split('-').reverse().join('-');
      const startDate = new Date(tempStartDate).toISOString();
      this.searchObj.criteria.startDate = startDate;
    }
    // tslint:disable-next-line: no-string-literal
    const endDateFormValue = this.filterSubscriptionsForm.controls['endDate'].value;
    if (endDateFormValue) {
      const tempEndDate = endDateFormValue.split('-').reverse().join('-');
      const endDate = new Date(tempEndDate).toISOString();
      this.searchObj.criteria.endDate = endDate;
    }
    if (this.searchObj.criteria.withAnyTriggerType) {
      this.searchObj.criteria.withAnyTriggerType = [this.searchObj.criteria.withAnyTriggerType];
    }
    this.fetchSubscriptionsList(this.searchObj);
  }

  resetSearchObjDates() {
    this.searchObj.criteria.startDate = null;
    this.searchObj.criteria.endDate = null;
  }

  async onOrganisationChange(value) {
    if (value === 'null' || value === null) {
      this.filterSubscriptionsForm.get('endpoint').disable();
      this.filterSubscriptionsForm.get('endpoint').setValue(null);
      this.filterSubscriptionsForm.get('channel').disable();
      this.filterSubscriptionsForm.get('channel').setValue(null);
      return;
    }
    if (value !== 'null') {
      const { endpoints } = await this.featuresService.getOrganisationDetails(value);
      this.endpointItems = endpoints;
      if (endpoints && this.endpointItems.length) {
        sortEndpoints(this.endpointItems);
        this.filterSubscriptionsForm.get('endpoint').enable();
      }
    }

  }

  onEndpointChange(value) {
    if (value === 'null') {
      this.filterSubscriptionsForm.get('channel').disable();
      this.filterSubscriptionsForm.get('channel').setValue(null);
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
      sortCommunicationChannels(this.communicationChannels);
      this.filterSubscriptionsForm.get('channel').enable();
    } else {
      this.filterSubscriptionsForm.get('channel').disable();
      this.filterSubscriptionsForm.get('channel').setValue(null);

    }
  }

  async fetchSubscriptionsList(searchObj = this.searchObj) {
    this.loadingIndicator = true;
    const result = await this.featuresService.fetchSubscriptionsList(searchObj);
    // this.searchObj.pagination.offset = result.data.currentPage;
    this.count = result.data.totalCount;
    const { subscriptionList } = result.data;
    this.subscriptionList = subscriptionList;
    this.loadingIndicator = false;
    this.store.dispatch(new SUB.SetSubscriptionsList(subscriptionList));
  }

  onSort(event) {
    this.searchObj.pagination.offset = 0;
    let field;
    if (event.sorts[0].prop.includes('Name')) {
      field = event.sorts[0].prop.replace('Name', '');
    } else {
      field = event.sorts[0].prop;
    }
    this.searchObj.orderBy.direction = event.sorts[0].dir.toUpperCase();
    this.searchObj.orderBy.field = field.toUpperCase();
    this.fetchSubscriptionsList(this.searchObj);
  }

  onPageSizeChange(event) {
    this.searchObj.pagination.offset = 0;
    this.searchObj.pagination.pageSize = Number(event);
    this.fetchSubscriptionsList(this.searchObj);
  }

  onReset() {
    this.filterSubscriptionsForm.markAsPristine();
    // We need to provide initial values on reset as by default they will ALL be set to null
    // and back end does not agree with that.
    this.filterSubscriptionsForm.reset(this.initialFormValues);
    this.filterSubscriptionsForm.updateValueAndValidity();
  }

  setPage(pageInfo) {
    this.searchObj.pagination.offset = pageInfo.offset;
    this.fetchSubscriptionsList();
  }

  editSubscription({id}) {
    this.router.navigate(['subscriptions/edit-subscription', id]);
  }

  deleteSubscription({id, name}) {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.name = name;
    modalRef.result.then(res => {
      if (res === 'OK') {
        this.featuresService.deleteSubscription(id).subscribe(
          data => {
            if (data.code === 200) {
              this.fetchSubscriptionsList(this.searchObj);
            }
          }
        );
      }
    }, dismiss => {
    });
  }

  isInValidRange(subscription: SubscriptionModel): boolean {
    return moment().isBetween(subscription.startDate, subscription.endDate);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  close(alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  onActiveChange(event, {id}) {
    event.preventDefault();
    if(event.target.checked) {
      this.activateSubscription(event.target, id);
    } else {
      this.deactivateSubscription(event.target, id);
    }
  }

  async activateSubscription(target, id) {
    target.disabled = true;
    try {
      await this.featuresService.activateSubscription(id);
      target.checked = true;
    } catch (err) {
      this.alerts = [];
      this.alerts.push({
        type: 'danger',
        title: 'Subscription could not be activated',
        body: err.error.data
      });
    }
    target.disabled = null;
  }

  async deactivateSubscription(target, id) {
    target.disabled = true;
    try {
      await this.featuresService.deactivateSubscription(id);
      target.checked = false;
    } catch (err) {
      this.alerts = [];
      this.alerts.push({
        type: 'danger',
        title: 'Subscription could not be deactivated',
        body: err.error.data
      });
    }
    target.disabled = null;
  }
}
