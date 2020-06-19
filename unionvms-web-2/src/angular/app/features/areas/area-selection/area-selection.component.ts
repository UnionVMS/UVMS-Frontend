import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, OnChanges, } from '@angular/core';
import { FeaturesService } from '../../features.service';
import { ControlContainer, FormGroup, FormControl, FormArray } from '@angular/forms';
import { faTimes  } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { Subscription, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { StatusAction } from 'app/features/subscriptions/subscriptions.reducer';


interface Alert {
    type: string;
    message: string;
  }

@Component({
  selector: 'app-area-selection',
  templateUrl: './area-selection.component.html',
  styleUrls: ['./area-selection.component.scss']
})
export class AreaSelectionComponent implements OnInit, OnDestroy  {

  @Output() selectedAreasChange = new EventEmitter<any>();
  @Input() formArrayName;
  @Input() formGroup: FormGroup;
  systemLayersTypeList;
  userLayerType;
  system = 'SYSTEM';
  user = 'USER';
  areaType = '';
  checked = true;
  systemSelectionCategory = 'systemFromMap';
  userSelectionCategory = 'userFromMap';
  selectedAreas = [];
  selectedMapAreas: number;
  faTimes = faTimes;
  staticAlertClosed = false;
  alerts: Alert[] = [];
  private subscription: Subscription = new Subscription();
  clearForm$: Observable<StatusAction> = this.store.select(fromRoot.clearSubscriptionForm);

  get areas() {
    return this.formGroup.get('areas') as FormArray;
  }

  constructor(private featuresService: FeaturesService, public controlContainer: ControlContainer,
              private store: Store<fromRoot.State> ) { }

  ngOnInit(): void {
    this.initSystemLayers();
    this.initUserLayers();
    /* The following fields are not part of the form and on form reset, they maintain their previous state.
      This component needs to listen for an action fired from the new-subscription component so that it resets them.
    */
    // Comment in if you need to clear the 'areas selection' part of form
    // this.subscription.add(this.clearForm$.subscribe( clear => {
    //   if (clear.status) {
    //     this.areaType = '';
    //     this.systemSelectionCategory = 'systemFromMap';
    //     this.userSelectionCategory = 'userFromMap';
    //   }
    // }));

    this.subscription.add(this.formGroup.get('areas').valueChanges
    .pipe(distinctUntilChanged())
    .subscribe(value => {
        this.selectedAreasChange.emit(this.areas.value.length);
    }));
  }

  async initSystemLayers() {
    try {
      const result: any = await this.featuresService.getSystemAreaLayers();
      const {data: layersList} = result;
      this.systemLayersTypeList = layersList;
    } catch (err) {

    }
  }

  async initUserLayers() {
    try {
      const result: any = await this.featuresService.getUserAreaLayers();
      const {data: userLayerType} = result;
      this.userLayerType = userLayerType;
    } catch (err) {

    }

  }

  onSystemAreaChange(value) {
    this.areaType = value;
  }

  toggleArea(selectedArea) {
    const obj = {
        gid: selectedArea.gid,
        areaType: selectedArea.areaType,
        name: selectedArea.name
      };
    // list is empty = add selected area
    if (!this.areas.length) {
      this.areas.push(new FormControl(obj));
    } else {
      const diff = this.areas.value.findIndex(element => element.gid === selectedArea.gid && element.areaType === selectedArea.areaType);
      if (diff > -1) {
        this.areas.removeAt(diff);
      } else {
        this.areas.push(new FormControl(obj));
      }
    }

  }

  selectAllAreas(allAreas) {
    // list is empty, add all
    if (!this.areas.length) {
      allAreas.forEach(item => {
        const obj = {
          gid: item.gid,
          areaType: item.areaType,
          name: item.name
        };
        this.areas.push(new FormControl(obj));
      });
    } else {
      // find objects from incoming array not in current array
      const diff = allAreas.filter(item => {
        return !this.areas.value.some(element => {
          return item.gid === element.gid && item.areaType === element.areaType ;
        });
      });
      diff.forEach(item => {
        const obj = {
          gid: item.gid,
          areaType: item.areaType,
          name: item.name
        };
        this.areas.push(new FormControl(obj));
      });
    }
  }

  removeArea(index) {
    this.areas.removeAt(index);
  }

  clearAllAreas() {
    this.areas.clear();
  }

  selectMapArea(selectedArea) {
    if (!Array.isArray(selectedArea) && selectedArea.hasOwnProperty('message')) {
      this.staticAlertClosed = false;
      this.alerts = [];
      this.alerts.push({
        type: 'warning',
        message: 'There is no selectable area on the specified location.'
      });
      this.closeAlert();
      return;
    } else if (!Array.isArray(selectedArea)) {
      const diff = this.areas.value.findIndex(element => element.gid === selectedArea.gid && element.areaType === selectedArea.areaType);
      if (diff > -1) {
        this.staticAlertClosed = false;
        this.alerts = [];
        this.alerts.push({
          type: 'warning',
          message: 'This area is already added to you current selection'
        });
        this.closeAlert();
      } else {
        this.areas.push(new FormControl(selectedArea));
      }
    }
  }

  closeAlert() {
    setTimeout(() => this.staticAlertClosed = true, 5000);
    this.staticAlertClosed = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
