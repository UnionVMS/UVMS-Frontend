import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FeaturesService } from 'app/features/features.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { faCheck  } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-area-selection-table',
  templateUrl: './area-selection-table.component.html',
  styleUrls: ['./area-selection-table.component.scss']
})
export class AreaSelectionTableComponent implements OnInit {

  @Input() mode;
  @Input() areaType?;
  @Output() selectArea = new EventEmitter<any>();
  results: [];
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  faCheck = faCheck;


  constructor(private featuresService: FeaturesService) { }

  ngOnInit(): void {
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
    this.selectArea.emit(row);
  }

}
