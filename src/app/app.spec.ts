import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { App } from './app';

// Mock SwUpdate
class MockSwUpdate {
  activateUpdate = vi.fn().mockResolvedValue(undefined);
  isEnabled = vi.fn().mockReturnValue(false);
  checkForUpdate = vi.fn().mockResolvedValue(false);
  versionUpdates = {
    subscribe: vi.fn()
  };
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SwUpdate, useClass: MockSwUpdate }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hola, Angular.PWA.OfflineForm');
  });
});
