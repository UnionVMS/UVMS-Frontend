import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaSelectionTableComponent } from './area-selection-table.component';

describe('AreaSelectionTableComponent', () => {
  let component: AreaSelectionTableComponent;
  let fixture: ComponentFixture<AreaSelectionTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaSelectionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaSelectionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
