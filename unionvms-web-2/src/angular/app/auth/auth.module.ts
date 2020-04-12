
import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';

import { SharedModule } from '../shared/shared.module';




@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    LoginComponent
  ]
})
export class AuthModule { }
