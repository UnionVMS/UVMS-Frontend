import { Component, OnInit, Output, EventEmitter, forwardRef, HostBinding, Input, } from '@angular/core';
import { FeaturesService } from '../../features.service';
import { ControlContainer, FormGroup, FormControl, FormArray } from '@angular/forms';
import { faTimes  } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-area-selection',
  templateUrl: './area-selection.component.html',
  styleUrls: ['./area-selection.component.scss']
})
export class AreaSelectionComponent implements OnInit  {

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

  get areas() {
    return this.formGroup.get('areas') as FormArray;
  }


  constructor(private featuresService: FeaturesService, public controlContainer: ControlContainer ) { }

  ngOnInit(): void {
    this.initSystemLayers();
    this.initUserLayers();
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
    this.areas.push(new FormControl(selectedArea));
    this.selectedAreasChange.emit(this.areas.value.length);
  }

  removeArea(index) {

  }
}
