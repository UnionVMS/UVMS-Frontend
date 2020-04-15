import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { faCalendar, faRetweet } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SubscriptionFormModel } from '../subscription-form.model';
import { Organization } from '../organization.model';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { Observable, Subscription } from 'rxjs';
import { FeaturesService } from 'app/features/features.service';
import { EndPoint } from '../endpoint.model';
import { CommunicationChannel } from '../communication-channel.model';



@Component({
  selector: 'app-subscription-form',
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.scss']
})
export class SubscriptionFormComponent implements OnInit, OnDestroy  {
  @Input() subscriptionObject: SubscriptionFormModel;
  @Output() save = new EventEmitter<any>();
  endpointItems: EndPoint[] = [];
  communicationChannels: CommunicationChannel[] = [];
  faCalendar = faCalendar;
  faRetweet = faRetweet;
  subscriptionForm: FormGroup;
  messageTypes;
  organizations$: Observable<Organization[]> = this.store.select(fromRoot.getOrganizations);
  organizations: Organization[];
  private subscription: Subscription = new Subscription();


  constructor(private fb: FormBuilder, private store: Store<fromRoot.State>, private featuresService: FeaturesService) { }

  ngOnInit(): void {
    this.initForm();
    this.initMessageTypes();
    this.subscription.add(this.organizations$.subscribe(organizations => this.organizations = organizations));
  }

  initForm() {
    this.subscriptionForm = this.fb.group({
      name: [''],
      accessibility: [''],
      description: [''],
      active: [false],
      output: this.fb.group({
        messageType: [''],
        emails: [''],
        alert: [false],
        subscriber: this.fb.group({
          organizationId: [null],
          endpointId: [{value: null, disabled: true}],
          channelId: [{value: null, disabled: true}]
        }),
        logbook: [false],
        consolidated: [false],
        vesselIds: [''],
        generateNewReportId: [false],
        history: [1]
      }),
      execution: this.fb.group({
        triggerType: [''],
        frequency: [''],
        immediate: [false],
        timeExpression: ['']
      }),
      startDate: [null],
      endDate: [null]
    });

    this.initSubscriptions();
  }

  initSubscriptions() {
      // Changes for organization
    this.subscription.add(this.subscriptionForm.get('output.subscriber.organizationId').valueChanges.subscribe(value => {
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
    this.save.emit();
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
