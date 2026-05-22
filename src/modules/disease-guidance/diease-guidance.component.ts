import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DiseaseSidebarComponent } from './disease-sidebar.component';
import { MonitoringSetupComponent } from './monitoring-setup.component';
import { RecommendationsSetupComponent, SeverityData } from './recommendations-setup.component';
import { TranslationService } from './translation.service';
import { DiseaseGuideService } from './disease-guidance.service';
import { DiseaseDto } from './disease-guidance.dto';

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
    DiseaseSidebarComponent,
    MonitoringSetupComponent,
    RecommendationsSetupComponent
  ],
  templateUrl: './disease-guidance.component.html',
})
export class DiseaseGuidanceComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  translating: Record<string, boolean> = {};

  selectedLabel: string = '';
  selectedDiseaseKey: string | null = null;

  existingRecords: DiseaseDto[] = [];

  isEditMode: boolean = false;
  currentEditId: number | null = null;
  selectedDisease: any = null;
  currentStep: number = 1;

  private destroy$ = new Subject<void>();
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private diseaseService = inject(DiseaseGuideService);
  private translationService = inject(TranslationService);

  ngOnInit(): void {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameTl: ['', Validators.required],
      descEn: ['', Validators.required],
      descTl: ['', Validators.required],
    });

    this.fetchExistingDiseases();
  }

  sevData: SeverityData = {
    mild: { actions: [], prevention: [], escalateEn: '', escalateTl: '', seekHelpEn: '', seekHelpTl: '' },
    moderate: { actions: [], prevention: [], escalateEn: '', escalateTl: '', seekHelpEn: '', seekHelpTl: '' },
    severe: { actions: [], prevention: [], escalateEn: '', escalateTl: '', seekHelpEn: '', seekHelpTl: '' }
  };

  diseaseKeys: string[] = [
    'black_pod_disease',
    'cacao_pod_borer',
    'mealybug',
    'healthy',
    'non_cacao'
  ];

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.debounceTimers).forEach(clearTimeout);
  }

  /**
   * Helper getter to verify if a valid disease configuration context
   * has been saved or chosen out of the structural list.
   */
  get isDiseaseContextActive(): boolean {
    return !!this.currentEditId && !!this.selectedDiseaseKey;
  }

  // ─── STEP NAVIGATION ───
  setStep(step: number): void {
    // If attempting to access step 2 or 3 without an active disease context, block action
    if (step > 1 && !this.isDiseaseContextActive) {
      console.warn('[NAVIGATION BLOCKED] Select or Save a disease profile row first before arranging rules.');
      return;
    }
    this.currentStep = step;
  }

  formatLabel(key: string): string {
    if (!key) return '';
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
    this.currentStep = 1; // Always route back to safety layout baseline step 1
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

    console.group('[DISEASE SAVE]');
    console.log('Mode:', this.isEditMode ? 'UPDATE' : 'CREATE');
    console.log('Payload:', payload);
    console.groupEnd();

    const request$ =
      this.isEditMode && this.currentEditId
        ? this.diseaseService.updateDisease(this.currentEditId, payload)
        : this.diseaseService.createDisease(payload);

    request$.subscribe({
      next: (res: any) => {
        const saved = res?.data ?? res;

        console.group('[SAVE SUCCESS]');
        console.log(saved);
        console.groupEnd();

        alert(
          this.isEditMode
            ? `Updated: ${saved.display_name?.en}`
            : `Created: ${saved.display_name?.en}`
        );

        // Lock in context properties immediately so they can now proceed onto Steps 2 & 3 without losing state
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
}
