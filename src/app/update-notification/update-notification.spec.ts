import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { UpdateNotification } from './update-notification';

// Mock SwUpdate
class MockSwUpdate {
  activateUpdate = vi.fn().mockResolvedValue(undefined);
  isEnabled = vi.fn().mockReturnValue(false);
  checkForUpdate = vi.fn().mockResolvedValue(false);
  versionUpdates = {
    subscribe: vi.fn()
  };
}

describe('UpdateNotification', () => {
  let component: UpdateNotification;
  let fixture: ComponentFixture<UpdateNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateNotification],
      providers: [
        { provide: SwUpdate, useClass: MockSwUpdate }
      ]
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
