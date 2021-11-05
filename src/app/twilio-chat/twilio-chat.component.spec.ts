import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwilioChatComponent } from './twilio-chat.component';

describe('TwilioChatComponent', () => {
  let component: TwilioChatComponent;
  let fixture: ComponentFixture<TwilioChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwilioChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwilioChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
