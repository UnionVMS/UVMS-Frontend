import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, } from '@angular/core';
import { FeaturesService } from '../../features.service';
import { ControlContainer, FormGroup, FormControl, FormArray } from '@angular/forms';
import { faTimes  } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-area-selection',
  templateUrl: './area-selection.component.html',
  styleUrls: ['./area-selection.component.scss']
})
export class AreaSelectionComponent implements OnInit, OnDestroy  {

  @Output() selectedAreasChange = new EventEmitter<any>();
  @Input() formArrayName;
  @Input() formGroup: FormGroup;
  systemLayersList;
  userLayersList;
  system = 'SYSTEM';
  user = 'USER';
  areaType;
  checked = true;
  systemSelectionCategory = 'systemFromMap';
  userSelectionCategory = 'userFromMap';
  selectedAreas = [];
  faTimes = faTimes;
  private subscription: Subscription = new Subscription();
  clearForm$: Observable<boolean> = this.store.select(fromRoot.clearSubscriptionForm);

  get areas() {
    return this.formGroup.get('areas') as FormArray;
  }


  constructor(private featuresService: FeaturesService, public controlContainer: ControlContainer,
              private store: Store<fromRoot.State> ) { }

  ngOnInit(): void {
    this.initSystemLayers();
    this.initUserLayers();
    this.subscription.add(this.clearForm$.subscribe( clear => {
      if (clear) {
        debugger;
        this.areaType = '';
        this.systemSelectionCategory = 'systemFromMap';
        this.userSelectionCategory = 'userFromMap';
      }
    }));
  }

  async initSystemLayers() {
    try {
      const result: any = await this.featuresService.getSystemAreaLayers();
      const {data: layersList} = result;
      this.systemLayersList = layersList;
    } catch (err) {

    }
  }

  async initUserLayers() {
    try {
      const result: any = await this.featuresService.getUserAreaLayers();
      const {data: layersList} = result;
      this.userLayersList = layersList;
    } catch (err) {

    }

  }

  onSystemAreaChange(value) {
    this.areaType = value;
  }

  selectArea(selectedArea) {
    debugger;
    this.areas.push(new FormControl(selectedArea));
    this.selectedAreasChange.emit(this.areas.value.length);
  }

  removeArea(index) {
    this.areas.removeAt(index);
    this.selectedAreasChange.emit(this.areas.value.length);

  }

  clearAllAreas() {
    this.areas.clear();
    this.selectedAreasChange.emit(this.areas.value.length);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
