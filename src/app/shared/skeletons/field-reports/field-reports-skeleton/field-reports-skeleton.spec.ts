import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldReportsSkeleton } from './field-reports-skeleton';

describe('FieldReportsSkeleton', () => {
  let component: FieldReportsSkeleton;
  let fixture: ComponentFixture<FieldReportsSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldReportsSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldReportsSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
