import { Directive, forwardRef, Host, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CbMultiselectComponent } from './cbmultiselect.component';

const CB_MULTISELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CbMultiselectValueAccessor),
  multi: true
};

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: 'app-cbmultiselect[formControl],app-cbmultiselect[formControlName],app-cbmultiselect[ngModel]',
  providers: [CB_MULTISELECT_VALUE_ACCESSOR]
})
// tslint:disable-next-line: directive-class-suffix
export class CbMultiselectValueAccessor implements ControlValueAccessor {

  private onChangeCb: any;

  constructor(
    @Host() private component: CbMultiselectComponent
  ) {}

  @HostListener('valueChanged', ['$event'])
  onValueChanged(event: any) {
    this.onChangeCb(event);
  }

  writeValue(value: any): void {
    this.component.writeValue(value);
  }

  registerOnChange(onChangeCb: any): void {
    this.onChangeCb = onChangeCb;
  }

  registerOnTouched(fn: any): void {
    // we don't care for now
  }

  setDisabledState?(isDisabled: boolean): void {
    // we don't care for now
  }
}
