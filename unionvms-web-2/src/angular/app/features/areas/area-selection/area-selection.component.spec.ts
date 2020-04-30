import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaSelectionComponent } from './area-selection.component';

describe('AreaSelectionComponent', () => {
  let component: AreaSelectionComponent;
  let fixture: ComponentFixture<AreaSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
