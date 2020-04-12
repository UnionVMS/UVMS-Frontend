import { SubscriptionsComponent } from './features/subscriptions/subscriptions.component';
import { TodayComponent } from './features/today/today.component';
import { MainComponent } from './core/main/main.component';
import { LoginComponent } from './auth/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { featureRoutes } from './features/features-routing.module';



const routes: Routes = [
  // FOR FUTURE USE, MAYBE WE CAN GET AWAY WITHOUT IT FOR NOW
  // { path: 'login', component: LoginComponent},
  {
    path: '', component: MainComponent,
    children: [
      ...featureRoutes

  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
