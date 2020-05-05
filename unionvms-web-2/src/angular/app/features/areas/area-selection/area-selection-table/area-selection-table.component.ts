import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FeaturesService } from 'app/features/features.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { faCheck  } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-area-selection-table',
  templateUrl: './area-selection-table.component.html',
  styleUrls: ['./area-selection-table.component.scss']
})
export class AreaSelectionTableComponent implements OnInit, OnDestroy {

  @Input() mode;
  @Input() areaType?;
  @Output() selectArea = new EventEmitter<any>();
  results: [];
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  faCheck = faCheck;
  private subscription: Subscription = new Subscription();


  constructor(private featuresService: FeaturesService) { }

  ngOnInit(): void {
    this.subscription.add();
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
