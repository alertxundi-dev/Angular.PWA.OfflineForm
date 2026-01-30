import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateNotification } from './update-notification';

describe('UpdateNotification', () => {
  let component: UpdateNotification;
  let fixture: ComponentFixture<UpdateNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
