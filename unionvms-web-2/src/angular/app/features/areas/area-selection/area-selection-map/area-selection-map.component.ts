import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FeaturesService } from 'app/features/features.service';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps';
import * as olProj from 'ol/proj';
import * as olControl from 'ol/control';
import * as olInteraction from 'ol/interaction';
import * as olEventsCondition from 'ol/events/condition';
import TileWMS from 'ol/source/TileWMS';
import LayerSwitcher from 'ol-layerswitcher';
import { SystemArea } from './system-area.model';
import { environment } from '../../../../../environments/environment';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-area-selection-map',
  templateUrl: './area-selection-map.component.html',
  styleUrls: ['./area-selection-map.component.scss']
})
export class AreaSelectionMapComponent implements OnInit, OnChanges, OnDestroy {

  @Input() systemAreasTypes?: SystemArea[];
  @Input() userAreaType?: [];
  @Input() selectedAreaType;
  @Output() selectMapArea = new EventEmitter<any>();
  @Input() formGroup: FormGroup;
  mapBasicConfig;
  map;
  timeout;
  showMap = true;
  multipleAreasFromMap: any;
  isMapTable = true;
  system = 'SYSTEM';



  get areas() {
    return this.formGroup.get('areas') as FormArray;
  }

  constructor(private featureService: FeaturesService) { }

  ngOnInit(): void {
    this.getMapConfig();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.removeLayerByType(changes.selectedAreaType.previousValue);
    this.lazyLoadWMSLayer();
    this.showMap = true;
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
    const controls = [];
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
      interactions
    });
    const mapView = this.createMapView(this.mapBasicConfig.projection);

    this.map.setView(new View(mapView));
    this.addBaseLayers();
    const layers = this.map.getLayers();
    if (layers.getLength() > 1) {
        const switcher = new LayerSwitcher({
            controlClass: 'left-side-up'
        });
        this.map.addControl(switcher);
    }


    this.map.on('singleclick', (evt) => {
      const projection = this.map.getView().getProjection().getCode();
      let requestData = {
         areaType: typeof(this.selectedAreaType) === 'string' ? this.selectedAreaType : this.selectedAreaType.typeName,
         isGeom: false,
         longitude: evt.coordinate[0],
         latitude: evt.coordinate[1],
         crs: projection.split(':')[1]
      };
      this.selectAreaFromMap(requestData);
  });
  }

  setProjection(proj) {
    let worldExtent = [-180, -89.99, 180, 89.99];
    if (proj.worldExtent) {
      const tempExt = proj.worldExtent.split(';');
      worldExtent = [parseFloat(tempExt[0]), parseFloat(tempExt[1]), parseFloat(tempExt[2]), parseFloat(tempExt[3])];
    }

    const ext = proj.extent.split(';');
    const projection = new olProj.Projection({
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

    const center = olProj.transform([-1.81185, 52.44314], 'EPSG:4326', `EPSG:${config.epsgCode}`);
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
    const items = [
      new olInteraction.MouseWheelZoom(),
      new olInteraction.KeyboardZoom(),
      new olInteraction.DoubleClickZoom(),
      new olInteraction.DragZoom({
        out: true,
        condition: olEventsCondition.altKeyOnly
      }),
      new olInteraction.PinchZoom()
    ];
    interactions.push(...items);
    return interactions;
  }


  createPanInteractions() {
    const interactions = [];
    const items = [
      new olInteraction.DragPan(),
      new olInteraction.KeyboardPan()
    ];
    interactions.push(...items);
    return interactions;
  }

  addBaseLayers() {
    this.mapBasicConfig.layers.baseLayers.forEach(layerConfig => {
      switch (layerConfig.type) {
        case 'OSM':
          this.addOSM(layerConfig);
          break;
        case 'WMS':
          this.addWMS(layerConfig, true);
          break;
        case 'BING':
          this.addBing(layerConfig);
          break;
      }
    });
  }

  addOSM(layerConfig) {
    const layer = this.defineOsm(layerConfig);
    layer.set('switchertype', 'base'); // Necessary for the layerswitcher control
    this.map.addLayer(layer);
  }

  addWMS(layerConfig, isBaseLayer = false) {
    let config;
    if (isBaseLayer) {
      config = this.getBaseLayerConfig(layerConfig);
    } else {
      config = this.getGenericLayerConfig(layerConfig);
    }

    const layer = this.defineWms(config);

    if (isBaseLayer) {
      layer.set('switchertype', 'base'); // Necessary for the layerswitcher control
    }

    this.map.addLayer(layer);
  }

  addBing(layerConfig) {
    const layer = this.defineBing(layerConfig);
    layer.set('switchertype', 'base'); // Necessary for the layerswitcher control
    this.map.addLayer(layer);
  }

  defineOsm(config) {
    return new TileLayer({
      type: config.type ? config.type : 'osm',
      title: config.title ? config.title : null,
      isBaseLayer: config.isBaseLayer ? config.isBaseLayer : null,
      source: new OSM()
    });
  }

  defineBing(config) {
    return new TileLayer({
      type: config.type,
      title: config.title,
      isBaseLayer: config.isBaseLayer,
      source: new BingMaps({
        key: config.apiKey,
        imagerySet: config.layerGeoName,
        maxZoom: 19
      })
    });
  }

  defineWms(config) {
    let source, attribution,
        isInternal = false;

    if (config.attribution) {
      attribution = new TileWMS.Attribution({
          html: config.attribution
      });
    }

    if (config.serverType && config.serverType === 'geoserver') {
      isInternal = true;
    }
    source = new TileWMS({
        attributions: attribution ? [attribution] : undefined,
        url: environment.geoserverURL,
        serverType: isInternal ? config.serverType : undefined,
        params: config.params,
        crossOrigin: 'anonymous'
    });

    if (isInternal) {
      source.setTileLoadFunction(this.customTileLoaderFunction);
    }

    return new TileLayer({
      title: config.title,
      isInternal,
      type: config.type ? config.type : 'WMS',
      longAttribution: config.longAttribution ? config.longAttribution : undefined,
      isBaseLayer: config.isBaseLayer ? config.isBaseLayer : undefined,
      source
    });
  }

  // We need to perform request manually to include JWT
  customTileLoaderFunction(imageTile, src) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', src, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
        let img = imageTile.getImage();
        if (typeof window.btoa === 'function') {
          if (this.status === 200) {
            let uInt8Array = new Uint8Array(this.response);
            let i = uInt8Array.length;
            let binaryString = new Array(i);
            while (i--) {
                binaryString[i] = String.fromCharCode(uInt8Array[i]);
            }
            let data = binaryString.join('');
            let type = xhr.getResponseHeader('content-type');
            if (type.indexOf('image') === 0) {
                img.src = 'data:' + type + ';base64,' + window.btoa(data);
            }
          }
        } else {
          img.src = src;
        }
    };
    xhr.onerror = () => {
        let img = imageTile.getImage();
        img.src = '';
    };
    xhr.send();

  }

  getBaseLayerConfig(def) {
    const mapExtent = this.map.getView().getProjection().getExtent();
    let style = null;
    if (def.styles) {

      def.styles.forEach((sldName, styleName) => {
        if (styleName === 'labelGeom') {
          style = sldName;
        } else if (styleName === 'geom' && style === null) {
          style = sldName;
        }
      });
    }

    let serverType;
    if (def.serverType) {
      serverType = def.serverType;
    }

    let attribution;
    if (def.shortCopyright) {
      attribution = def.shortCopyright;
    }

    const config = {
      title: def.title,
      type: def.type,
      isBaseLayer: def.isBaseLayer,
      url: environment.geoserverURL,
      serverType,
      attribution,
      params: {
        time_: (new Date()).getTime(),
        LAYERS: def.layerGeoName,
        TILED: true,
        TILESORIGIN: mapExtent[0] + ',' + mapExtent[1],
        STYLES: style
      }
    };

    return config;
  }

  getGenericLayerConfig(def) {
    const mapExtent = this.map.getView().getProjection().getExtent();

    let attribution;
    if (def.shortCopyright) {
      attribution = def.shortCopyright;
    }

    const config = {
      type: def.typeName,
      url: environment.geoserverURL,
      serverType: 'geoserver',
      attribtution: attribution,
      params: {
        time_: (new Date()).getTime(),
        LAYERS: def.geoName,
        TILED: true,
        TILESORIGIN: mapExtent[0] + ',' + mapExtent[1],
        STYLES: def.style,
        cql_filter: def.cql ? def.cql : null
      }
    };
    return config;
  }


  getFullDefForItem(type) {
    let item;
    for (let entry of this.systemAreasTypes) {
      if (entry.typeName === type) {
        item = entry;
      }
    }
    return item;
  }

  lazyLoadWMSLayer() {
    let item;
    if (this.selectedAreaType.typeName === 'USERAREA') {
      item = this.userAreaType;
    } else {
      item = this.getFullDefForItem(this.selectedAreaType);
    }
    this.timeout = setTimeout(() => { this.addWMS(item); }, 100);
  }
  removeLayerByType(layerType) {
    if (this.map) {
        const mapLayers = this.map.getLayers();
        if (mapLayers.getLength() > 1) {
            const layer = mapLayers.getArray().find(item => item.get('type') === layerType);
            this.map.removeLayer(layer);
        }
    }
  }

  async selectAreaFromMap(area) {
    try {
      const result: any = await this.featureService.getAreaDetails(area);
      let numberOfResults = result.data.length;
      if (numberOfResults === 0) {
        // no results
        this.selectMapArea.emit({message: 'No selectable area found'});
      } else if (numberOfResults === 1) {
        // just one result
        this.selectMapArea.emit({
          gid: result.data[0].gid,
          name: result.data[0].name,
          areaType: typeof(this.selectedAreaType) === 'string' ? this.selectedAreaType : this.selectedAreaType.typeName
        });
      } else {
        // multiple results
        const temp = [...result.data];
        temp.forEach(item => {
          item.areaType = typeof(this.selectedAreaType) === 'string' ? this.selectedAreaType : this.selectedAreaType.typeName;
        })
        this.selectMapArea.emit(temp);
        this.showMap = false;
        this.multipleAreasFromMap = temp;

      }
    } catch (err) {

    }
  }

  onShowMap() {
    this.showMap = true;
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

  ngOnDestroy() {
  }
}
