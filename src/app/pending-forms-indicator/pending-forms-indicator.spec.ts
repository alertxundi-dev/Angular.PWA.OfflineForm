import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingFormsIndicator } from './pending-forms-indicator';

describe('PendingFormsIndicator', () => {
  let component: PendingFormsIndicator;
  let fixture: ComponentFixture<PendingFormsIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingFormsIndicator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingFormsIndicator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
