import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DiseaseGuideService } from './services/disease-guidance.service';
import { DiseaseDto } from './disease-guidance.dto';
import { ToastService } from '../../app/shared/components/toast/toast.service';

import { DiseaseViewModalComponent } from './widgets/disease-view-modal/disease-view-modal.component';
import { DiseaseTableSkeletonComponent } from '../../app/shared/skeletons/disease-guidance/disease-table-skeleton/disease-table-skeleton';
import { DiseaseTableComponent } from './widgets/disease-table.component';

import { GeneralInfoFormComponent } from './widgets/general-info-form/general-info-form.component';
import { MonitoringSetupComponent } from './widgets/monitoring-setup/monitoring-setup.component';
import {
  RecommendationsSetupComponent,
  SeverityData,
} from './widgets/recommendations-setup/recommendations-setup.component';

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
    GeneralInfoFormComponent,
    MonitoringSetupComponent,
    RecommendationsSetupComponent,
  ],
  templateUrl: './disease-guidance.component.html',
})
export class DiseaseGuidanceComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  selectedLabel = '';
  selectedDiseaseKey: string | null = null;
  existingRecords: DiseaseDto[] = [];

  isEditMode = false;
  currentEditId: number | null = null;
  showAddedDiseases = true;
  isLoading = false;

  isViewModalOpen = false;
  viewingDisease: DiseaseDto | null = null;
  isSavingDisease = false;

  currentStep = 1;
  readonly steps = [
    { number: 1, label: 'General information' },
    { number: 2, label: 'Monitoring' },
    { number: 3, label: 'Recommendations' },
  ];
  translating: Record<string, boolean> = {};
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private diseaseService = inject(DiseaseGuideService);
  private toastService = inject(ToastService);

  diseaseKeys: string[] = [
    'black_pod_disease',
    'cacao_pod_borer',
    'mealybug',
    'healthy',
    'non_cacao',
  ];

  sevData: SeverityData = {
    mild: {
      actions: [],
      prevention: [],
      escalateEn: '',
      escalateTl: '',
      seekHelpEn: '',
      seekHelpTl: '',
    },
    moderate: {
      actions: [],
      prevention: [],
      escalateEn: '',
      escalateTl: '',
      seekHelpEn: '',
      seekHelpTl: '',
    },
    severe: {
      actions: [],
      prevention: [],
      escalateEn: '',
      escalateTl: '',
      seekHelpEn: '',
      seekHelpTl: '',
    },
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

  get isDiseaseContextActive(): boolean {
    return !!this.currentEditId && !!this.selectedDiseaseKey;
  }

  get isSaveDisabled(): boolean {
    return this.form.invalid || !this.selectedLabel || this.isSavingDisease;
  }

  setStep(step: number): void {
    if (step > 1 && !this.isDiseaseContextActive) {
      return;
    }
    this.currentStep = step;
  }

  onLabelSelectedFromChild(key: string): void {
    this.selectedLabel = key;
    this.selectedDiseaseKey = key;
  }

  onEnInput(sourceControlName: string, targetControlName: string): void {
    const text = this.form.get(sourceControlName)?.value?.trim();
    clearTimeout(this.debounceTimers[targetControlName]);

    if (!text) {
      this.form.get(targetControlName)?.setValue('');
      return;
    }

    this.translating[targetControlName] = true;
    this.debounceTimers[targetControlName] = setTimeout(async () => {
      try {
      } catch {
      } finally {
        this.translating[targetControlName] = false;
        this.cdr.markForCheck();
      }
    }, 900);
  }

  onSaveAndContinue(): void {
    this.onSave(true);
  }

  onFinishConfiguration(): void {
    this.cancelEdit();
    this.fetchExistingDiseases();
  }

  onCancelInternal(): void {
    this.currentStep = 1;
    this.cancelEdit();
  }

  onTableViewDisease(disease: DiseaseDto): void {
    this.viewingDisease = disease;
    this.isViewModalOpen = true;
  }

  onTableEditDisease(disease: DiseaseDto): void {
    this.showAddedDiseases = false;
    this.onSidebarDiseaseSelected(disease);
  }

  onTableDeleteConfirmed(id: number): void {
    this.existingRecords = this.existingRecords.filter((d) => d.id !== id);
    this.cdr.markForCheck();
  }

  onSidebarDiseaseSelected(disease: any): void {
    if (disease?.disease_key) {
      this.selectedLabel = disease.disease_key;
      this.selectedDiseaseKey = disease.disease_key;
      this.isEditMode = true;
      this.currentEditId = disease.id;

      this.form.patchValue({
        nameEn: disease.display_name?.en || '',
        nameTl: disease.display_name?.tl || '',
        descEn: disease.description?.en || '',
        descTl: disease.description?.tl || '',
      });
    }
  }

  fetchExistingDiseases(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.diseaseService
      .getDisease()
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
        },
      });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.currentEditId = null;
    this.selectedLabel = '';
    this.selectedDiseaseKey = null;
    this.form.reset();
    this.showAddedDiseases = true;
  }

  onSave(advanceAfterSave = false): void {
    if (this.form.invalid || !this.selectedDiseaseKey) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isSavingDisease) return;

    this.isSavingDisease = true;
    const wasEditing = this.isEditMode && !!this.currentEditId;

    const payload = {
      disease_key: this.selectedDiseaseKey,
      locale: 'en',
      display_name: {
        en: this.form.value.nameEn,
        tl: this.form.value.nameTl,
      },
      description: {
        en: this.form.value.descEn,
        tl: this.form.value.descTl,
      },
    };

    const request$ =
      this.isEditMode && this.currentEditId
        ? this.diseaseService.updateDisease(this.currentEditId, payload)
        : this.diseaseService.createDisease(payload);

    request$.subscribe({
      next: (res: any) => {
        const saved = res?.data ?? res;
        this.currentEditId = saved?.id ?? this.currentEditId;
        this.isEditMode = true;
        this.isSavingDisease = false;
        const action = wasEditing ? 'updated' : 'created';
        this.toastService.show('success', 'Success', `Disease guidance ${action} successfully.`);
        this.fetchExistingDiseases();
        if (advanceAfterSave) this.currentStep = 2;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSavingDisease = false;
        this.toastService.show(
          'error',
          'Error',
          'Failed to save disease guidance. Please try again.',
        );
        this.cdr.markForCheck();
      },
    });
  }

  onToggleView(): void {
    if (this.showAddedDiseases) {
      this.isEditMode = false;
      this.currentEditId = null;
      this.selectedLabel = '';
      this.selectedDiseaseKey = null;
      this.form.reset();
      this.currentStep = 1;
      this.showAddedDiseases = false;
      return;
    }

    this.cancelEdit();
    this.fetchExistingDiseases();
  }
}
