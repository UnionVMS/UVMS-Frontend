import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSubsriptionComponent } from './edit-subsription.component';

describe('EditSubsriptionComponent', () => {
  let component: EditSubsriptionComponent;
  let fixture: ComponentFixture<EditSubsriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSubsriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSubsriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
