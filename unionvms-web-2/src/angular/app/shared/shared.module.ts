import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';


const MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  FontAwesomeModule,
  NgbModule
];



@NgModule({
  declarations: [
    DateTimePickerComponent
  ],
  imports: [
    ...MODULES
  ],
  exports: [
    ...MODULES,
    DateTimePickerComponent
  ]
})
export class SharedModule { }
