import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TodayComponent} from './today/today.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { NotFoundComponent } from './pagenotfound/notfound.component';
import { ManageSubscriptionsComponent } from './subscriptions/manage-subscriptions/manage-subscriptions.component';
import { NewSubscriptionComponent } from './subscriptions/new-subscription/new-subscription.component';
import { SubscriptionsGuard } from './subscriptions/subscriptions.guard';
import { EditSubsriptionComponent } from './subscriptions/edit-subsription/edit-subsription.component';
import { ManualSubscriptionsComponent } from './subscriptions/manual-subscriptions/manual-subscriptions.component';
import {EditSubscriptionsGuard} from "./subscriptions/edit.subscriptions.guard";


export const featureRoutes: Routes = [
  { path: 'today', component: TodayComponent },
  { path: 'subscriptions', component: SubscriptionsComponent,
    canActivate: [SubscriptionsGuard],
    data: {
      pageTitle: 'Subscriptions'
    },
    children: [
      { path: '', redirectTo: 'manage-subscriptions', pathMatch: 'full' },
      { path: 'manage-subscriptions', component: ManageSubscriptionsComponent },
      { path: 'new-subscription', component: NewSubscriptionComponent, canActivate : [EditSubscriptionsGuard]},
      { path: 'edit-subscription/:id', component: EditSubsriptionComponent },
      { path: 'manual-subscriptions', component: ManualSubscriptionsComponent, canActivate : [EditSubscriptionsGuard]}
    ]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(featureRoutes)
  ],
  exports: [
    RouterModule
  ]

})
export class FeaturesRoutingModule {}

// NOTE: is it possible to incorporate routes declared as child routes to main routing module??
