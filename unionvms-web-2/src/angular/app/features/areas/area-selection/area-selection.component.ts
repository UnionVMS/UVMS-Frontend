import { Component, OnInit, Output, EventEmitter, forwardRef, HostBinding, } from '@angular/core';
import { FeaturesService } from '../../features.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { faTimes  } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-area-selection',
  templateUrl: './area-selection.component.html',
  styleUrls: ['./area-selection.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AreaSelectionComponent),
      multi: true
    }
  ]
})
export class AreaSelectionComponent implements OnInit, ControlValueAccessor  {

  @Output() selectedAreasChange = new EventEmitter<any>();
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


  constructor(private featuresService: FeaturesService) { }

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
    //debugger;
    this.selectedAreas.push(selectedArea);
    this.selectedAreasChange.emit(this.selectedAreas.length)

  }

  removeArea(index) {

  }

  writeValue(obj: any): void {
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {

  }



}
