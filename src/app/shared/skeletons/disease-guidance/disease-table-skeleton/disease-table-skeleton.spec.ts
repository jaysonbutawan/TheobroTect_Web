import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseTableSkeleton } from './disease-table-skeleton';

describe('DiseaseTableSkeleton', () => {
  let component: DiseaseTableSkeleton;
  let fixture: ComponentFixture<DiseaseTableSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiseaseTableSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiseaseTableSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
