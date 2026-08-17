import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanHistoryProfileSkeletonComponent } from './scan-history-skeleton';

describe('ScanHistoryProfileSkeletonComponent', () => {
  let component: ScanHistoryProfileSkeletonComponent;
  let fixture: ComponentFixture<ScanHistoryProfileSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanHistoryProfileSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanHistoryProfileSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
