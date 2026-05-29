import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsSkeleton } from './stats-skeleton';

describe('StatsSkeleton', () => {
  let component: StatsSkeleton;
  let fixture: ComponentFixture<StatsSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
