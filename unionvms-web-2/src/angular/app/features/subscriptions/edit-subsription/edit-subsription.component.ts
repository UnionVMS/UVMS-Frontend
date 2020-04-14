import { Component, OnInit } from '@angular/core';
import { SubscriptionFormModel } from '../subscription-form.model';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-edit-subsription',
  templateUrl: './edit-subsription.component.html',
  styleUrls: ['./edit-subsription.component.scss']
})
export class EditSubsriptionComponent implements OnInit {
  subscription: SubscriptionFormModel;

  constructor(private featuresService: FeaturesService) { }

  ngOnInit(): void {
  }

  editSubscription() {
    console.log('edit');

  }

}
