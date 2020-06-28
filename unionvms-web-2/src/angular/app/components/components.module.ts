import { NgModule } from '@angular/core';
import { CbMultiselectComponent } from 'app/components/cbmultiselect/cbmultiselect.component';
import { CbMultiselectValueAccessor } from 'app/components/cbmultiselect/cbmultiselect.valueaccessor';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [
    CbMultiselectComponent,
    CbMultiselectValueAccessor
  ],
  imports: [
    SharedModule
  ],
  exports: [
    CbMultiselectComponent,
    CbMultiselectValueAccessor
  ]
})
export class ComponentsModule {}
