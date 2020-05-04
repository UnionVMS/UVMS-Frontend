import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaSelectionMapComponent } from './area-selection-map.component';

describe('AreaSelectionMapComponent', () => {
  let component: AreaSelectionMapComponent;
  let fixture: ComponentFixture<AreaSelectionMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaSelectionMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaSelectionMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
