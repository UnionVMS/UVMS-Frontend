import { Component, OnInit } from '@angular/core';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-area-selection',
  templateUrl: './area-selection.component.html',
  styleUrls: ['./area-selection.component.scss']
})
export class AreaSelectionComponent implements OnInit {

  systemLayersList;
  userLayersList;

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



}
