import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { MainModule } from './core/main/main.module';
import { StoreModule } from '@ngrx/store';
import { REDUCERS } from './app.reducer';
import { FeaturesModule } from './features/features.module';
import { AuthGuard } from './auth/auth.guard';
import { HTTP_INTERCEPT_PROVIDERS } from './http-interceptors';
import { SubscriptionsGuard } from './features/subscriptions/subscriptions.guard';
import { SharedModule } from './shared/shared.module';
import { ComponentsModule } from 'app/components/components.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AuthModule,
    MainModule,
    FeaturesModule,
    ComponentsModule,
    SharedModule,
    StoreModule.forRoot(REDUCERS)
  ],
  providers: [AuthGuard, HTTP_INTERCEPT_PROVIDERS, SubscriptionsGuard ],
  bootstrap: [AppComponent]
})
export class AppModule { }
