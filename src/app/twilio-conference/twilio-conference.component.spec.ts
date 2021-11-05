import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwilioConferenceComponent } from './twilio-conference.component';

describe('TwilioConferenceComponent', () => {
  let component: TwilioConferenceComponent;
  let fixture: ComponentFixture<TwilioConferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwilioConferenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwilioConferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
