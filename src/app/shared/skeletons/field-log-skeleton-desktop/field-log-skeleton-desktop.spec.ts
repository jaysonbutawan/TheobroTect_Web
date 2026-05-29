import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldLogSkeletonDesktop } from './field-log-skeleton-desktop';

describe('FieldLogSkeletonDesktop', () => {
  let component: FieldLogSkeletonDesktop;
  let fixture: ComponentFixture<FieldLogSkeletonDesktop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldLogSkeletonDesktop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldLogSkeletonDesktop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
