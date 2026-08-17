import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsSkeletonComponent } from './stats-skeleton';

describe('StatsSkeletonComponent', () => {
  let component: StatsSkeletonComponent;
  let fixture: ComponentFixture<StatsSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
