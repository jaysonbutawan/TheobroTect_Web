import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldLogSkeletonMobile } from './field-log-skeleton-mobile';

describe('FieldLogSkeletonMobile', () => {
  let component: FieldLogSkeletonMobile;
  let fixture: ComponentFixture<FieldLogSkeletonMobile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldLogSkeletonMobile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldLogSkeletonMobile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
