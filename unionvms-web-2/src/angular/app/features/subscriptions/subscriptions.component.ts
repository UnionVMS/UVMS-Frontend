import {Component, OnInit} from '@angular/core';
import {FeaturesService} from '../features.service';
import {Store} from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import * as SUB from '../subscriptions/subscriptions.actions';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {

  constructor(private featuresService: FeaturesService, private store: Store<fromRoot.State>) { }

  ngOnInit(): void {
    this.getOrganisations();

  }

  async getOrganisations() {
    const {results: organisations} = await this.featuresService.getOrganisations();
    this.store.dispatch(new SUB.SetOrganisations(organisations));
  }
}
