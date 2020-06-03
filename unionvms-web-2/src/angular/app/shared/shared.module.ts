import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { RemoveUnderscorePipe } from './remove_underscore.pipe';
import { GroupByPipe } from './group_by.pipe';


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
    RemoveUnderscorePipe,
    GroupByPipe
  ],
  imports: [
    ...MODULES
  ],
  exports: [
    ...MODULES,
    RemoveUnderscorePipe,
    GroupByPipe
  ]
})
export class SharedModule { }
