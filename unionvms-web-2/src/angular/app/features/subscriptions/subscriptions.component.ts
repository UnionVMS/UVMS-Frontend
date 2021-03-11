import {Component, OnInit} from '@angular/core';
import {FeaturesService} from '../features.service';
import {Store} from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import * as SUB from '../subscriptions/subscriptions.actions';
import {SubscriptionRightsService} from "../../services/subscription-rights.service";

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  canEdit: boolean = false;

  constructor(private featuresService: FeaturesService, private store: Store<fromRoot.State>, subscriptionRightsService: SubscriptionRightsService) {
    subscriptionRightsService.canEdit().then(canEdit => {
      this.canEdit = canEdit;
    })
  }

  ngOnInit(): void {
    this.getOrganisations();

  }

  async getOrganisations() {
    const {results: organisations} = await this.featuresService.getOrganisations(100);
    this.store.dispatch(new SUB.SetOrganisations(organisations));
  }
}
