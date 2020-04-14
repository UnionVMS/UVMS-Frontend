import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SubscriptionFormModel } from '../subscription-form.model';


@Component({
  selector: 'app-subscription-form',
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.scss']
})
export class SubscriptionFormComponent implements OnInit {
  @Input() subscription: SubscriptionFormModel;
  @Output() save = new EventEmitter<any>();
  faCalendar = faCalendar;
  subscriptionForm: FormGroup;


  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
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
        subscriber: [{}],
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
  }

  onSubmit(event) {
    this.save.emit();
  }

}
