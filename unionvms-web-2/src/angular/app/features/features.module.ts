import { NgModule } from '@angular/core';
import {NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../shared/shared.module';
import { TodayComponent } from './today/today.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { NotFoundComponent } from './pagenotfound/notfound.component';
import { MainModule } from '../core/main/main.module';
import { ManageSubscriptionsComponent } from './subscriptions/manage-subscriptions/manage-subscriptions.component';
import { NewSubscriptionComponent } from './subscriptions/new-subscription/new-subscription.component';
import { FeaturesRoutingModule } from './features-routing.module';
import { EditSubsriptionComponent } from './subscriptions/edit-subsription/edit-subsription.component';
import { SubscriptionFormComponent } from './subscriptions/subscription-form/subscription-form.component';

@NgModule({
  declarations: [
    TodayComponent,
    SubscriptionsComponent,
    NotFoundComponent,
    ManageSubscriptionsComponent,
    NewSubscriptionComponent,
    EditSubsriptionComponent,
    SubscriptionFormComponent

  ],
  imports: [
    SharedModule,
    MainModule,
    FeaturesRoutingModule,
    NgxDatatableModule.forRoot({
      messages: {
        emptyMessage: 'No data to display', // Message to show when array is presented, but contains no values
        totalMessage: 'total', // Footer total message
        selectedMessage: 'selected' // Footer selected message
      }
    })
  ],
  exports: [
    TodayComponent,
    SubscriptionsComponent
  ]
})
export class FeaturesModule { }
