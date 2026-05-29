import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanHistorySkeleton } from './scan-history-skeleton';

describe('ScanHistorySkeleton', () => {
  let component: ScanHistorySkeleton;
  let fixture: ComponentFixture<ScanHistorySkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanHistorySkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanHistorySkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
