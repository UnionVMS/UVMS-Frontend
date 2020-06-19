import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { FeaturesService } from '../../features.service';
import * as jwt_decode from 'jwt-decode';
import { ColumnMode, SelectionType  } from '@swimlane/ngx-datatable';
import { faCheck, faEye, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/app.reducer';
import { Subscription, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { StatusAction } from 'app/features/subscriptions/subscriptions.reducer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ASSET_TYPE } from './asset-type.enum';
import { AssetPreviewModalComponent } from './assetpreviewmodal/asset-preview-modal.component';


@Component({
  selector: 'app-asset-selection',
  templateUrl: './asset-selection.component.html',
  styleUrls: ['./asset-selection.component.scss']
})
export class AssetSelectionComponent implements OnInit, OnDestroy {
  @ViewChild('AssetListTable') assetListTable: any;
  @ViewChild('AssetListGroupTable') assetListGroupTable: any;
  @Input() formGroup: FormGroup;
  @Input() formArrayName;
  @Output() selectedAssetsChange = new EventEmitter<any>();
  vesselSearchItems = [];
  assetType = ASSET_TYPE.asset;
  result = [];
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  loadingIndicator = false;
  reorderable = true;
  faCheck = faCheck;
  faEye = faEye;
  faTimes = faTimes;
  faSpinner = faSpinner;
  selectedAssets: number;
  selectedGroups: number;
  selectedAsset = [];
  selectedGroup;
  isLoading = false;
  private subscription: Subscription = new Subscription();
  clearForm$: Observable<StatusAction> = this.store.select(fromRoot.clearSubscriptionForm);
  assetTypes = ASSET_TYPE;
  searchObj;
  searchText;
  count;
  assetGroupCount;
  assetGroupSearchObj;
  isVisible = false;

  get assets() {
    return this.formGroup.get('assets') as FormArray;
  }

  constructor(private featuresService: FeaturesService, private modalService: NgbModal, private store: Store<fromRoot.State>) { }

  ngOnInit(): void {
    this.setVesselSearchItems();
    this.subscription.add(this.formGroup.get('assets').valueChanges
    .pipe(distinctUntilChanged())
    .subscribe(value => {
      this.selectedAssetsChange.emit(this.assets.value.length);
      this.countSelectedAssetTypes(value);
    }));

    /* The following fields are not part of the form and on form reset, they maintain their previous state.
      This component needs to listen for an action fired from the new-subscription component so that it resets them.
    */
    // Comment in if you need to clear the 'asset selection' part of the form
    // this.subscription.add(this.clearForm$.subscribe( clear => {
    //   if (clear.status) {
    //     this.result = [];
    //     this.count = 0;
    //     this.assets.clear();
    //     this.selectedAssetsChange.emit(this.assets.value.length);
    //     this.selectedAssets = 0;
    //     this.selectedGroups = 0;
    //   }
    // }));
    this.searchObj = {
      pagination: {
        page: 0,
        listSize: 10
     },
     assetSearchCriteria: {
        isDynamic: false,
        criterias: []
     }
    };
  }

  setVesselSearchItems() {
    this.vesselSearchItems = [
      { name: 'Assets', value: 'ASSET'},
      { name: 'Assets group', value: 'VGROUP'}
    ];
  }

  async searchAsset() {
    this.loadingIndicator = true;
    const criteria = this.buildSearchCriteria();
    const assetSearchCriteria = {
      isDynamic: false,
      criterias: criteria
    };
    const obj = {...this.searchObj, assetSearchCriteria};

    const result: any = await  this.featuresService.getAssets(obj);
    this.result = result.data.asset;
    this.count = result.data.totalResults;
    this.loadingIndicator = false;

  }

  buildSearchCriteria() {
    const searchableFields = ['FLAG_STATE', 'EXTERNAL_MARKING', 'NAME', 'IRCS', 'CFR'];
    return searchableFields.map(item => {
      let obj = {
        key: item,
        value: `${this.searchText}*`
      };
      return obj;
     });
  }

  onAssetTypeChange() {
    // reset pagination as both assets and asset groups share the same object for pagination (same table)
    this.searchObj.pagination.page = 0;
    this.assetListTable.offset = 0;
    if (this.assetType === ASSET_TYPE.group) {
      this.getAssetGroups();
    }
    this.result = [];
    this.count = 0;
  }

  async getAssetGroups() {
    this.loadingIndicator = true;
    const token = localStorage.getItem('token');
    const { userName: username } = jwt_decode(token);
    console.log(username)

    let obj = {...this.searchObj};
    delete obj.assetSearchCriteria.criterias;
    const result: any = await this.featuresService.getAssetsGroups(obj, username);
    this.result = result.data.assetGroup;
    this.count = result.data.totalResults;
    this.loadingIndicator = false;
  }

  onToggleAsset(selectedRow) {
    const guid = selectedRow.eventHistory?.eventId || selectedRow.guid;

    const obj = {
      name: selectedRow.name,
      guid,
      type: this.assetType
    };
  // list is empty = add selected area
    if (!this.assets.length) {
      this.assets.push(new FormControl(obj));
    } else {
      const diff = this.assets.value.findIndex(element => element.guid === guid);
      if (diff > -1) {
        this.assets.removeAt(diff);
      } else {
        this.assets.push(new FormControl(obj));
      }
    }
  }

  async onPreviewAsset(row) {
    this.selectedAsset = [row];
    const modalRef = this.modalService.open(AssetPreviewModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.assetType = this.assetType;
    // selectedAsset can be a single asset or a group for which we need to preview included assets
    modalRef.componentInstance.selectedAsset = this.selectedAsset;
    modalRef.componentInstance.title = this.selectedAsset[0].name;

  }

  async getAssetGroupDetails(guid) {
    const result: any = await this.featuresService.getAssetsGroupsDetails(guid);
    this.selectedAsset = result.data;
  }

  countSelectedAssetTypes(selectedItems) {
    this.selectedAssets = selectedItems.reduce((acc, cur) => cur.type ===  ASSET_TYPE.asset  ? ++acc : acc, 0);
    this.selectedGroups = selectedItems.reduce((acc, cur) => cur.type === ASSET_TYPE.group ? ++acc : acc, 0);
  }

  clearAllAssets() {
    this.assets.clear();
  }

  getIsSelected(selectedRow) {
    const guid = selectedRow.eventHistory?.eventId || selectedRow.guid;
    return this.assets.value.some(item => item.guid === guid);
  }

  addAllAssets() {
    // list is empty, add all
    if (!this.assets.length) {
      this.result.forEach(item => {
        const guid = item.assetId?.guid || item.guid;
        const obj = {
          guid,
          type: this.assetType,
          name: item.name
        };
        this.assets.push(new FormControl(obj));
      });
    } else {
      // find objects from results array not in assets array
      const diff = this.result.filter(item => {
        return !this.assets.value.some(element => {
          const itemGuid = item.assetId?.guid || item.guid;
          const elementGuid = element.assetId?.guid || element.guid;
          return itemGuid === elementGuid ;
        });
      });
      diff.forEach(item => {
        const guid = item.assetId?.guid || item.guid;
        const obj = {
          guid,
          type: this.assetType,
          name: item.name
        };
        this.assets.push(new FormControl(obj));
      });
    }

  }

  removeAsset(index) {
    this.assets.removeAt(index);
  }

  onReset() {
    this.result = [];
    this.searchText = '';
    this.count = 0;

  }

  setPage(pageInfo) {
    this.searchObj.pagination.page = pageInfo.offset;

    if (this.assetType === ASSET_TYPE.asset) {
      this.searchAsset();
    }  else {
      this.getAssetGroups();
    }
  }

  onSort(param) {

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
