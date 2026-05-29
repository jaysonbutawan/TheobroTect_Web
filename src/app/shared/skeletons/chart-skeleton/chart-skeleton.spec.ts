import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSkeleton } from './chart-skeleton';

describe('ChartSkeleton', () => {
  let component: ChartSkeleton;
  let fixture: ComponentFixture<ChartSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
