import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CbMultiselectItem } from './CbMultiselectItem';

function contains(list: any[], value: any, equalsFn: (a: any, b: any) => boolean): boolean {
  return (list || []).some(x => equalsFn(value, x));
}

function simpleEquals(a: any, b: any): boolean {
  if (a === b) {
    return true;
  } else {
    const akeys = Object.keys(a);
    if (akeys.length !== Object.keys(b).length) {
      return false;
    }
    return akeys.every(key => a[key] === b[key]);
  }
}

@Component({
  selector: 'app-cbmultiselect',
  templateUrl: './cbmultiselect.component.html',
  styleUrls: ['./cbmultiselect.component.scss']
})
export class CbMultiselectComponent implements OnInit, OnDestroy {

  @Output()
  valueChanged = new EventEmitter<any[]>();

  itemsByType: { key: string, value: CbMultiselectItem[] }[] = [];
  form: FormGroup;
  /**
   * This is an almost-random id prefix, to allow many instances of this component.
   * The problem is that the custom Bootstrap checkboxes require the label `for`
   * attribute and  unique id.
   */
  idPrefix = Math.random().toString(36).substring(7);
  private value: any[];
  private subscription: Subscription = new Subscription();
  private settingValue = false;

  constructor(
    private fb: FormBuilder
  ) {
    this.form = fb.group({});
  }

  ngOnInit(): void {
    this.subscription.add(this.form.valueChanges.subscribe((newValue: {[key: string]: boolean[]}) => {
      if (this.itemsByType.length > 0 && !this.settingValue) {
        this.value = this.itemsByType.reduce((aggr, itemByType) => aggr.concat(this.extractValue(itemByType, newValue)), []);
        this.valueChanged.emit(this.value);
      }
    }));
  }

  @Input()
  set items(newItems: CbMultiselectItem[]) {
    this.makeItemsByType(newItems);
    this.makeForm();
  }

  private makeItemsByType(newItems: CbMultiselectItem[]) {
    const itemsByType = (newItems || []).reduce((aggr, cur) => {
      if (!aggr[cur.type]) {
        aggr[cur.type] = [cur];
      } else {
        aggr[cur.type].push(cur);
      }
      return aggr;
    }, {} as {[key: string]: CbMultiselectItem[]});
    this.itemsByType = Object.keys(itemsByType).map(key => ({ key, value: itemsByType[key] }));
  }

  private makeForm() {
    Object.keys(this.form.controls).forEach(key => this.form.removeControl(key));
    (this.itemsByType || []).forEach(itemByType =>
      this.form.addControl(
        itemByType.key,
        this.fb.array((itemByType.value || []).map(item => (!!this.value && this.value.indexOf(item.value) >= 0)))
      )
    );
  }

  private extractValue(itemByType: {key: string, value: CbMultiselectItem[]}, newValue: {[key: string]: boolean[]}): any[] {
    const checked = newValue[itemByType.key];
    return itemByType.value.reduce((aggr, item, index) => checked[index] ? [...aggr, item.value] : aggr, []);
  }

  writeValue(value: any[]) {
    try {
      this.settingValue = true;
      this.value = value;
      const newFormValue = (this.itemsByType || []).reduce((aggr, itemByType) => {
        aggr[itemByType.key] = itemByType.value.map(item => contains(value, item.value, simpleEquals));
        return aggr;
      }, {} as {[key: string]: boolean[]});
      this.form.setValue(newFormValue);
    } finally {
      this.settingValue = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
