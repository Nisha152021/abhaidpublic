import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAbhaIdComponent } from './create-abha-id.component';

describe('CreateAbhaIdComponent', () => {
  let component: CreateAbhaIdComponent;
  let fixture: ComponentFixture<CreateAbhaIdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAbhaIdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAbhaIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
