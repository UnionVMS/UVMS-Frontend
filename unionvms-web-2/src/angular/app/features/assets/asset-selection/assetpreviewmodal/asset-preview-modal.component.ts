import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FeaturesService } from 'app/features/features.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType  } from '@swimlane/ngx-datatable';
import { ASSET_TYPE } from '../asset-type.enum';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'app-asset-preview-modal',
  templateUrl: 'asset-preview-modal.component.html',
  styleUrls: ['./asset-preview-modal.component.scss']
})
export class AssetPreviewModalComponent implements OnInit {
  @ViewChild('AssetListGroupTable') assetListGroupTable: any;
  @Input() assetType;
  @Input() selectedAsset;
  @Input() title;
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  loadingIndicator = false;
  reorderable = true;
  assetTypes = ASSET_TYPE;
  searchObj;
  selectedGroup = [];
  count;
  faSpinner = faSpinner;



constructor(private featuresService: FeaturesService, public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.searchObj = {
      pagination: {
        page: 0,
        listSize: 5
      },
      assetSearchCriteria: {
        isDynamic: false,
        criterias: []
      }
    };


    if (this.assetType === ASSET_TYPE.group) {
      this.searchObj.assetSearchCriteria.criterias = this.selectedAsset[0].searchFields;
      this.getAssetsForGroup();
    } else {
      /* emulate single selected assets belonging to a group
       so that empty additional info template part is not shown when a group has no assets
      */
      this.selectedGroup.length = 1;
    }
  }

  setPage(pageInfo) {
    this.searchObj.pagination.page = pageInfo.offset;
    this.getAssetsForGroup();
  }

  async getAssetsForGroup() {
    this.loadingIndicator = true;
    const result: any = await this.featuresService.getAssets(this.searchObj);
    this.loadingIndicator = false;
    this.selectedGroup = result.data.asset;
    this.selectedAsset = [result.data.asset[0]];

    this.count = result.data.totalResults;
  }

  onSelectRow(row) {
    this.selectedAsset = [row.selected[0]];
  }

  getAvailableIdentifier(asset) {
    if(asset.name) {
      return asset.name;
    } else if (asset.cfr) {
      return "CFR: " + asset.cfr;
    } else if (asset.ircs) {
      return "IRCS: " + asset.ircs;
    } else if (asset.uvi) {
      return "UVI: " + asset.uvi;
    } else if (asset.externalMarking) {
      return "Ext. Marking: " + asset.externalMarking;
    } else if (asset.iccat) {
      return "ICCAT: " + asset.iccat;
    }
  }
}
