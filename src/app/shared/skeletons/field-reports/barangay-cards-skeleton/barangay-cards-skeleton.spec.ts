import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarangayCardsSkeleton } from './barangay-cards-skeleton';

describe('BarangayCardsSkeleton', () => {
  let component: BarangayCardsSkeleton;
  let fixture: ComponentFixture<BarangayCardsSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarangayCardsSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarangayCardsSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
