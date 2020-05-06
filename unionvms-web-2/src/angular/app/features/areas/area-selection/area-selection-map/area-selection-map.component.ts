import { Component, OnInit, Input } from '@angular/core';
import { FeaturesService } from 'app/features/features.service';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import * as olControl from 'ol/control';
import * as olInteraction from 'ol/interaction';
// import * as olEvents from 'ol/events';

@Component({
  selector: 'app-area-selection-map',
  templateUrl: './area-selection-map.component.html',
  styleUrls: ['./area-selection-map.component.scss']
})
export class AreaSelectionMapComponent implements OnInit {

  @Input() systemAreas?: [];
  @Input() userAreas?: [];
  mapBasicConfig;
  map;





  constructor(private featureService: FeaturesService) { }

  ngOnInit(): void {
    this.getMapConfig();
  }

  async getMapConfig() {
      try {
        const result: any = await this.featureService.getMapBasicConfig();
        this.mapBasicConfig = result.data.map;
        this.initMap();


      } catch (err) {

      }
  }

  initMap() {
    let controls = [];
    controls.push(new olControl.Attribution({
        collapsible: false,
        collapsed: false,
        zoom: true
    }));

    const panInteractions = this.createPanInteractions();
    const zoomInteractions = this.createZoomInteractions();
    const interactions = [...panInteractions, ...zoomInteractions];


    this.map = new Map({
      target: 'map',
      // controls,
      interactions,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ]
    });
    const mapView = this.createMapView(this.mapBasicConfig.projection);

    this.map.setView(new View(mapView));



  }

  setProjection(proj) {
    // registerProjInProj4(proj);

    let worldExtent = [-180, -89.99, 180, 89.99];
    if (proj.worldExtent) {
      let tempExt = proj.worldExtent.split(';');
      worldExtent = [parseFloat(tempExt[0]), parseFloat(tempExt[1]), parseFloat(tempExt[2]), parseFloat(tempExt[3])];
    }

    let ext = proj.extent.split(';');
    let projection = new olProj.Projection({
        code: 'EPSG:' + proj.epsgCode,
        units: proj.units,
        axisOrientation: proj.axis,
        global: proj.global,
        extent: [parseFloat(ext[0]), parseFloat(ext[1]), parseFloat(ext[2]), parseFloat(ext[3])],
        worldExtent
    });

    return projection;
  }

  createMapView(config) {
    const projection = this.setProjection(this.mapBasicConfig.projection);

    const center = olProj.transform([-1.81185, 52.44314], 'EPSG:4326', 'EPSG:' + config.epsgCode);
    const viewObj = {
      projection,
      center,
      zoom: 3,
      maxZoom: 19,
      enableRotation: false
    };

    return viewObj;

  }


  createZoomInteractions() {
    const interactions = [];
    interactions.push(new olInteraction.MouseWheelZoom());
    interactions.push(new olInteraction.KeyboardZoom());
    interactions.push(new olInteraction.DoubleClickZoom());
    interactions.push(new olInteraction.DragZoom());
    // interactions.push(new olInteraction.DragZoom({
    //     out: true,
    //     condition: olEvents.condition.altKeyOnly
    // }));
    interactions.push(new olInteraction.PinchZoom());
    return interactions;
  }


  createPanInteractions() {
    // TODO: optimize
      let interactions = [];
      interactions.push(new olInteraction.DragPan());
      interactions.push(new olInteraction.KeyboardPan());
      return interactions;
  }

  addBaseLayers() {
    
  }






}
