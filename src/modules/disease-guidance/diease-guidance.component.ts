import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslationService } from './translation.service';
import { DiseaseGuideService } from './disease-guidance.service';
import { DiseaseDto } from './disease-guidance.dto';

// Interface for the dynamic checklist
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
    FormsModule
  ],
  templateUrl: './disease-guidance.component.html',
})
export class DiseaseGuidanceComponent implements OnInit, OnDestroy {
  // ─── FORM & TRANSLATION STATE ───
  form!: FormGroup;
  selectedLabel: string = '';
  translating: Record<string, boolean> = {};

  // ─── SPLIT-PANE UI STATE ───
  existingRecords: DiseaseDto[] = []; // Holds the data for the right panel
  isEditMode: boolean = false;
  currentEditId: string | null = null;

  // Step 2 dynamic checklist
  checklistItems: ChecklistItem[] = [];

  detectionLabels: string[] = [
    'black_pod_disease_mild',
    'black_pod_disease_moderate',
    'black_pod_disease_severe',
    'cacao_pod_borer_mild',
    'cacao_pod_borer_moderate',
    'cacao_pod_borer_severe',
    'healthy',
    'mealybug_mild',
    'mealybug_moderate',
    'mealybug_severe',
    'non_cacao'
  ];

  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private translationService = inject(TranslationService);
  private diseaseService = inject(DiseaseGuideService);

  // ─── LIFECYCLE ───
  ngOnInit(): void {
    this.form = this.fb.group({
      // Step 1 Fields
      nameEn: ['', Validators.required],
      nameTl: ['', Validators.required],
      descEn: ['', Validators.required],
      descTl: ['', Validators.required],

      // Step 2 Fields
      monitoringFreq: ['weekly', Validators.required],
      severityThreshold: ['', [Validators.required, Validators.min(1)]],

      rescanDays: [''],
      preferredTime: [''],
      guidanceEn: [''],
      guidanceTl: ['']
    });

    this.addChecklist();
    this.fetchExistingDiseases();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.debounceTimers).forEach(clearTimeout);
  }

  // ─── DATA FETCHING & EDITING ───
  fetchExistingDiseases(): void {
    this.diseaseService.getDisease()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.existingRecords = response.data || response || [];
        },
        error: (error) => {
          console.error('Failed to fetch existing diseases', error);
        }
      });
  }

  loadRecordForEditing(record: any): void {
    this.isEditMode = true;
    this.currentEditId = record.id || record._id || record.disease_key;

    this.form.patchValue({
      nameEn: record.display_name?.en || record.nameEn || '',
      nameTl: record.display_name?.tl || record.nameTl || '',
      descEn: record.description?.en || record.descEn || '',
      descTl: record.description?.tl || record.descTl || '',
      monitoringFreq: record.monitoring_setup?.frequency || 'weekly',
      severityThreshold: record.monitoring_setup?.threshold || '',
    });

    this.selectedLabel = record.disease_key || record.label || '';

    if (record.monitoring_setup?.checklist?.length) {
      this.checklistItems = [...record.monitoring_setup.checklist];
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.currentEditId = null;
    this.selectedLabel = '';
    this.checklistItems = [];
    this.addChecklist();
    this.form.reset({ monitoringFreq: 'weekly' });
  }

  // ─── CHECKLIST LOGIC ───
  addChecklist(): void {
    this.checklistItems.push({ en: '', tl: '', translating: false });
  }

  removeChecklist(index: number): void {
    this.checklistItems.splice(index, 1);
  }

  // ─── TRANSLATION LOGIC ───
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
      }
    }, 900);
  }

  onBulletEnInput(item: ChecklistItem, sourceKey: 'en', targetKey: 'tl'): void {
    const text = item[sourceKey]?.trim();
    const timerKey = `checklist_${this.checklistItems.indexOf(item)}`;

    clearTimeout(this.debounceTimers[timerKey]);

    if (!text) {
      item[targetKey] = '';
      return;
    }

    item.translating = true;

    this.debounceTimers[timerKey] = setTimeout(async () => {
      try {
        const translated = await this.translationService.translate(text);
        item[targetKey] = translated;
      } catch (error) {
        console.error('Translation failed for checklist item', error);
      } finally {
        item.translating = false;
      }
    }, 900);
  }

  // ─── SUBMISSION ───
  onSave(): void {
    if (this.form.invalid || !this.selectedLabel) {
      this.form.markAllAsTouched();
      return;
    }

    const validChecklists = this.checklistItems
      .filter(item => item.en.trim() !== '')
      .map(item => ({ en: item.en, tl: item.tl }));

    const payload: any = {
      disease_key: this.selectedLabel,
      locale: 'en',
      display_name: {
        en: this.form.value.nameEn,
        tl: this.form.value.nameTl
      },
      description: {
        en: this.form.value.descEn,
        tl: this.form.value.descTl
      },
      monitoring_setup: {
        frequency: this.form.value.monitoringFreq,
        threshold: this.form.value.severityThreshold,
        rescan_days: this.form.value.rescanDays,
        preferred_time: this.form.value.preferredTime,
        guidance: {
          en: this.form.value.guidanceEn,
          tl: this.form.value.guidanceTl
        },
        checklist: validChecklists
      }
    };

    if (this.isEditMode && this.currentEditId) {
      console.log('Updating record...', payload);
      // this.diseaseService.updateDisease(this.currentEditId, payload).subscribe({ ... })
    } else {
      this.diseaseService.createDisease(payload).subscribe({
        next: (response) => {
          alert('Disease saved successfully');
          this.fetchExistingDiseases();
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Failed to save disease', error);
          alert('Failed to save disease');
        }
      });
    }
  }
}
