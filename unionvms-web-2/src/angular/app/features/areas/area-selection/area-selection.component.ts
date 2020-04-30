import { Component, OnInit } from '@angular/core';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-area-selection',
  templateUrl: './area-selection.component.html',
  styleUrls: ['./area-selection.component.scss']
})
export class AreaSelectionComponent implements OnInit {

  layersList;

  constructor(private featuresService: FeaturesService) { }

  ngOnInit(): void {
    this.initLayers();
  }

  async initLayers() {
    try {
      const result: any = await this.featuresService.getAreaLayers();
      const {data: layersList} = result;
      this.layersList = layersList;
    } catch (err) {

    }
  }

}
