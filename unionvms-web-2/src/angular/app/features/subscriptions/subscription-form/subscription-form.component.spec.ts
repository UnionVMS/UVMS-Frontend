import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionFormComponent } from './subscription-form.component';

describe('SubscriptionFormComponent', () => {
  let component: SubscriptionFormComponent;
  let fixture: ComponentFixture<SubscriptionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
