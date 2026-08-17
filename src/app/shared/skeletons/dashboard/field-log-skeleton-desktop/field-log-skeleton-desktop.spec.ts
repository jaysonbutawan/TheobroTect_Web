import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldLogSkeletonDesktopComponent } from './field-log-skeleton-desktop';

describe('FieldLogSkeletonDesktopComponent', () => {
  let component: FieldLogSkeletonDesktopComponent;
  let fixture: ComponentFixture<FieldLogSkeletonDesktopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldLogSkeletonDesktopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldLogSkeletonDesktopComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
