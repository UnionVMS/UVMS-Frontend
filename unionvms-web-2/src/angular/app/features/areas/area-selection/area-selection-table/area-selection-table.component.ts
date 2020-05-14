import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { FeaturesService } from 'app/features/features.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { faCheck, faEye  } from '@fortawesome/free-solid-svg-icons';
import { Subscription, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { StatusAction } from 'app/features/subscriptions/subscriptions.reducer';
import { FormGroup, FormArray } from '@angular/forms';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';

@Component({
  selector: 'app-area-selection-table',
  templateUrl: './area-selection-table.component.html',
  styleUrls: ['./area-selection-table.component.scss']
})
export class AreaSelectionTableComponent implements OnInit, OnDestroy {

  @Input() mode;
  @Input() areaType?;
  @Input() formGroup: FormGroup;
  @Input() isMapTable?;
  @Input() resultsFromMap?: [];
  @Output() toggleArea = new EventEmitter<any>();
  @Output() selectAllAreas = new EventEmitter<any>();
  results: [];
  filter: '';
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  faCheck = faCheck;
  faEye = faEye;
  isSelected = true;
  previewMap;
  private subscription: Subscription = new Subscription();
  clearForm$: Observable<StatusAction> = this.store.select(fromRoot.clearSubscriptionForm);


  constructor(private featuresService: FeaturesService, private store: Store<fromRoot.State>) { }

  ngOnInit(): void {
    this.subscription.add(this.clearForm$.subscribe( clear => {
      if (clear.status) {
        this.results = [];
      }
    }));
    if (this.isMapTable) {
      this.loadingIndicator = false;
    }
  }

  get areas() {
    return this.formGroup.get('areas') as FormArray;
  }

  async onSubmit(form) {
    // TODO: refactor
    if (this.mode === 'USER') {
        try {
          const result: any = await this.featuresService.getUserAreasByFilter(form);
          this.results = result.data;
          this.loadingIndicator = false;
        } catch (err) {

        }
    } else {
      const obj = {
        filter: form.filter,
        areaType: this.areaType
      };
      try {
        const result: any = await this.featuresService.getSystemAreasByFilter(obj);
        this.results = result.data;
        this.loadingIndicator = false;

      } catch (err) {

      }

    }
  }

  onSelectArea(row) {
    debugger;
    this.toggleArea.emit(row);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addAllAreas() {
    debugger;
    const data = this.results || this.resultsFromMap;
    if (data) {
      this.selectAllAreas.emit(data);
    }
  }

  onReset() {
    this.results = [];
    this.filter = '';
  }

  getIsSelected(row) {
    return this.areas.value.some(item => item.gid === row.gid &&  item.areaType === row.areaType);
  }

  onShowPreviewData() {
    debugger;
    this.previewMap = new Map({
      target: 'preview-map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: olProj.fromLonLat([37.41, 8.82]),
        zoom: 4
      })
    });

  }

}
