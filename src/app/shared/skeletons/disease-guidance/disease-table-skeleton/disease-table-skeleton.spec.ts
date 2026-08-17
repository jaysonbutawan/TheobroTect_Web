import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseTableSkeletonComponent } from './disease-table-skeleton';

describe('DiseaseTableSkeletonComponent', () => {
  let component: DiseaseTableSkeletonComponent;
  let fixture: ComponentFixture<DiseaseTableSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiseaseTableSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiseaseTableSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
