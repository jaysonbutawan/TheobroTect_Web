import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DiseaseGuideService } from './services/disease-guidance.service';
import { DiseaseDto } from './disease-guidance.dto';
import { DiseaseViewModalComponent } from './widgets/disease-view-modal.component';
import { DiseaseTableSkeletonComponent } from '../../app/shared/skeletons/disease-guidance/disease-table-skeleton/disease-table-skeleton';
import { DiseaseTableComponent } from './widgets/disease-table.component';
import { DiseaseSetupComponent } from './widgets/disease-setup.component'; // Import the new child
import { SeverityData } from './widgets/recommendations-setup.component';

export interface ChecklistItem {
  en: string;
  tl: string;
  translating?: boolean;
}

@Component({
  selector: 'app-disease-guidance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DiseaseViewModalComponent,
    DiseaseTableSkeletonComponent,
    DiseaseTableComponent,
    DiseaseSetupComponent // Add to imports array
  ],
  templateUrl: './disease-guidance.component.html',
})
export class DiseaseGuidanceComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  searchQuery = '';
  filterLocale = '';
  selectedLabel = '';
  selectedDiseaseKey: string | null = null;
  existingRecords: DiseaseDto[] = [];

  isEditMode = false;
  currentEditId: number | null = null;
  selectedDisease: any = null;
  showAddedDiseases = true;
  editOpenedFromTable = false;
  isLoading = false;

  isViewModalOpen = false;
  viewingDisease: DiseaseDto | null = null;

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private diseaseService = inject(DiseaseGuideService);
  diseaseKeys: string[] = [
    'black_pod_disease',
    'cacao_pod_borer',
    'mealybug',
    'healthy',
    'non_cacao'
  ];

  sevData: SeverityData = {
    mild: { actions: [], prevention: [], escalateEn: '', escalateTl: '', seekHelpEn: '', seekHelpTl: '' },
    moderate: { actions: [], prevention: [], escalateEn: '', escalateTl: '', seekHelpEn: '', seekHelpTl: '' },
    severe: { actions: [], prevention: [], escalateEn: '', escalateTl: '', seekHelpEn: '', seekHelpTl: '' }
  };

  ngOnInit(): void {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameTl: ['', Validators.required],
      descEn: ['', Validators.required],
      descTl: ['', Validators.required],
    });

    this.fetchExistingDiseases();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTableViewDisease(disease: DiseaseDto): void {
    this.viewingDisease = disease;
    this.isViewModalOpen = true;
  }

  onTableEditDisease(disease: DiseaseDto): void {
    this.editOpenedFromTable = this.showAddedDiseases;
    this.showAddedDiseases = false;
    this.onSidebarDiseaseSelected(disease);
  }

  onTableDeleteConfirmed(id: number): void {
    this.existingRecords = this.existingRecords.filter(d => d.id !== id);
    this.cdr.markForCheck();
  }

  onSidebarDiseaseSelected(disease: any): void {
    this.selectedDisease = disease;
    if (disease?.disease_key) {
      this.selectedLabel = disease.disease_key;
      this.selectedDiseaseKey = disease.disease_key;
      this.isEditMode = true;
      this.currentEditId = disease.id;

      this.form.patchValue({
        nameEn: disease.display_name?.en || '',
        nameTl: disease.display_name?.tl || '',
        descEn: disease.description?.en || '',
        descTl: disease.description?.tl || ''
      });
    }
  }

  onDiseaseKeyChange(key: string): void {
    this.selectedLabel = key;
    this.selectedDiseaseKey = key;
  }

  fetchExistingDiseases(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.diseaseService.getDisease()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.existingRecords = res.data || res || [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

cancelEdit(): void {
  this.isEditMode = false;
  this.currentEditId = null;
  this.selectedLabel = '';
  this.selectedDiseaseKey = null;
  this.selectedDisease = null;
  this.form.reset();

  // Always return to the table view when resetting/canceling
  this.showAddedDiseases = true;
  this.editOpenedFromTable = false;
}

  onSave(): void {
    if (this.form.invalid || !this.selectedDiseaseKey) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      disease_key: this.selectedDiseaseKey,
      locale: 'en',
      display_name: {
        en: this.form.value.nameEn,
        tl: this.form.value.nameTl
      },
      description: {
        en: this.form.value.descEn,
        tl: this.form.value.descTl
      }
    };

    const request$ = this.isEditMode && this.currentEditId
      ? this.diseaseService.updateDisease(this.currentEditId, payload)
      : this.diseaseService.createDisease(payload);

    request$.subscribe({
      next: (res: any) => {
        const saved = res?.data ?? res;
        this.currentEditId = saved.id;
        this.isEditMode = true;
        this.fetchExistingDiseases();
      },
      error: () => {
        // Handle error gracefully via UI notification states
      }
    });
  }

  get filteredRecords(): DiseaseDto[] {
    return this.existingRecords.filter(d => {
      const matchesSearch = !this.searchQuery ||
        d.display_name?.en?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesLocale = !this.filterLocale || d.locale === this.filterLocale;
      return matchesSearch && matchesLocale;
    });
  }

  onToggleView(): void {
    this.showAddedDiseases = !this.showAddedDiseases;
    if (this.showAddedDiseases) {
      this.fetchExistingDiseases();
    }
  }
}
