import { Component, OnInit } from '@angular/core';
import { FeaturesService } from '../features.service';
import { Organization } from './organization.model';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import * as SUB from '../subscriptions/subscriptions.actions';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {

  constructor(private featuresService: FeaturesService, private store: Store<fromRoot.State>) { }

  ngOnInit(): void {
    this.getOrganizations();

  }

  async getOrganizations() {
    const {results: organizations} = await this.featuresService.getOrganizations();
    this.store.dispatch(new SUB.SetOrganizations(organizations));
  }
}
