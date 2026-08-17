import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldLogSkeletonMobileComponent } from './field-log-skeleton-mobile';

describe('FieldLogSkeletonMobileComponent', () => {
  let component: FieldLogSkeletonMobileComponent;
  let fixture: ComponentFixture<FieldLogSkeletonMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldLogSkeletonMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldLogSkeletonMobileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
