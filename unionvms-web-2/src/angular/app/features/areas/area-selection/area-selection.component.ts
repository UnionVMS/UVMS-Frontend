import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, OnChanges, } from '@angular/core';
import { FeaturesService } from '../../features.service';
import { ControlContainer, FormGroup, FormControl, FormArray } from '@angular/forms';
import { faTimes  } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { Subscription, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

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
  areaType = '';
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
    //debugger;
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
    if (Array.isArray(selectedArea)) {
      selectedArea.forEach(item => {
        const obj = {
          gid: item.gid,
          areaType: item.areaType,
          name: item.name
        };
        this.areas.push(new FormControl(obj));
      });

    } else {
      const obj = {
        gid: selectedArea.gid,
        areaType: selectedArea.areaType,
        name: selectedArea.name
      };
      this.areas.push(new FormControl(obj));
    }
  }

  removeArea(index) {
    this.areas.removeAt(index);
  }

  clearAllAreas() {
    this.areas.clear();
  }

  ngOnDestroy() {
    debugger;
    this.subscription.unsubscribe();
  }
}
