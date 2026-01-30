import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineData } from './offline-data';

describe('OfflineData', () => {
  let component: OfflineData;
  let fixture: ComponentFixture<OfflineData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflineData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
