import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MonitoringSetupComponent } from './widgets/monitoring-setup.component';
import { RecommendationsSetupComponent, SeverityData } from './widgets/recommendations-setup.component';
import { TranslationService } from './services/translation.service';
import { DiseaseGuideService } from './services/disease-guidance.service';
import { DiseaseDto } from './disease-guidance.dto';
import { DiseaseViewModalComponent } from './widgets/disease-view-modal.component';
import { DiseaseTableComponent } from './widgets/disease-table.component';
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
    MonitoringSetupComponent,
    RecommendationsSetupComponent,
    // DiseaseTableComponent,

  ],
  templateUrl: './disease-guidance.component.html',
})
export class DiseaseGuidanceComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  translating: Record<string, boolean> = {};
  searchQuery: string = '';
  filterLocale: string = '';

  selectedLabel: string = '';
  selectedDiseaseKey: string | null = null;
  existingRecords: DiseaseDto[] = [];

  isEditMode: boolean = false;
  currentEditId: number | null = null;
  selectedDisease: any = null;
  currentStep: number = 1;
  showAddedDiseases: boolean = false;
  editOpenedFromTable = false;

  // ─── VIEW MODAL ───
  isViewModalOpen: boolean = false;
  viewingDisease: DiseaseDto | null = null;

  private destroy$ = new Subject<void>();
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private diseaseService = inject(DiseaseGuideService);
  private translationService = inject(TranslationService);

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
    Object.values(this.debounceTimers).forEach(clearTimeout);
  }

  // ─── UTILITIES ───
  formatLabel(key: string): string {
    if (!key) return '';
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // ─── TABLE EVENT HANDLERS ───

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
    // 🔁 actual service call back-end deletion execution
    // this.diseaseService.deleteDisease(id).subscribe();
    console.warn('[DELETE CONFIRMED BY TABLE] ID:', id);

    // Remove from local array to instantly update the child UI
    this.existingRecords = this.existingRecords.filter(d => d.id !== id);
    this.cdr.markForCheck();
  }

  // ─── CORE FORM / NAVIGATION LOGIC ───

  get isDiseaseContextActive(): boolean {
    return !!this.currentEditId && !!this.selectedDiseaseKey;
  }

  setStep(step: number): void {
    if (step > 1 && !this.isDiseaseContextActive) {
      console.warn('[NAVIGATION BLOCKED] Select or Save a disease profile row first.');
      return;
    }
    this.currentStep = step;
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
        const translated = await this.translationService.translate(text);
        this.form.get(targetControlName)?.setValue(translated);
      } catch (error) {
        console.error(`Translation failed for ${targetControlName}`, error);
      } finally {
        this.translating[targetControlName] = false;
        this.cdr.markForCheck();
      }
    }, 900);
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

  get isSaveDisabled(): boolean {
    return this.form.invalid || !this.selectedLabel;
  }

  fetchExistingDiseases(): void {
    this.diseaseService.getDisease()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.existingRecords = res.data || res || [];
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Fetch error:', err);
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
    this.currentStep = 1;

    // If edit was triggered from the table, go back to it
    if (this.editOpenedFromTable) {
      this.showAddedDiseases = true;
      this.editOpenedFromTable = false;
    }
  }

  onSave(): void {
    if (this.form.invalid || !this.selectedDiseaseKey) {
      this.form.markAllAsTouched();
      console.warn('[SAVE BLOCKED] Missing form or disease selection');
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

    const request$ =
      this.isEditMode && this.currentEditId
        ? this.diseaseService.updateDisease(this.currentEditId, payload)
        : this.diseaseService.createDisease(payload);

    request$.subscribe({
      next: (res: any) => {
        const saved = res?.data ?? res;

        alert(
          this.isEditMode
            ? `Updated: ${saved.display_name?.en}`
            : `Created: ${saved.display_name?.en}`
        );

        this.currentEditId = saved.id;
        this.isEditMode = true;

        this.fetchExistingDiseases();
      },
      error: (err) => {
        console.error('[SAVE ERROR]', err);
        alert('Save failed. Check console.');
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
}
