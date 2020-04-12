import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { AuthGuard } from 'app/auth/auth.guard';



const routes: Routes = [
  { path: 'main', component: MainComponent, } // canActivate: [AuthGuard]
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]

})
export class MainRoutingModule {}
