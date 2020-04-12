import { ClockComponent } from './clock/clock.component';
import { NgModule } from '@angular/core';
import { MainComponent } from './main.component';
import { SharedModule } from '../../shared/shared.module';
import { MainRoutingModule } from './main-routing.module';
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';




@NgModule({
  declarations: [
    MainComponent,
    HeaderComponent,
    NavigationComponent,
    ClockComponent
  ],
  imports: [
    SharedModule,
    MainRoutingModule

  ],
  exports: [
    MainComponent
  ]
})
export class MainModule { }
