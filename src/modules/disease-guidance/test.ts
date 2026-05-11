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

import { TranslationService } from './translation.service';
// import { DiseaseGuideService } from './disease-guidance.service';

// ─── INTERFACES ───
export interface ChecklistItem {
  en: string;
  tl: string;
  translating?: boolean; // UI-only state to show the spinner
}

export interface DiseasePreviewDto {
  disease_key: string;
  name_en: string;
  name_tl: string;
  label: string;
  // Optional existing data if they've configured this before
  rescanDays?: number;
  preferredTime?: string;
  guidanceEn?: string;
  guidanceTl?: string;
  checklist?: ChecklistItem[];
}

@Component({
  selector: 'app-disease-monitoring',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './test.html', 
})
export class DiseaseMonitoringComponent implements OnInit, OnDestroy {

  form!: FormGroup;

  // ─── MASTER-DETAIL STATE ───
  diseases: DiseasePreviewDto[] = [];
  selectedDisease: DiseasePreviewDto | null = null;

  // ─── DYNAMIC CHECKLIST & TRANSLATION ───
  checklistItems: ChecklistItem[] = [];
  translating: Record<string, boolean> = {};

  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private translationService = inject(TranslationService);
  // private diseaseService = inject(DiseaseGuideService);

  ngOnInit(): void {
    // 1. Initialize the reactive form for the Monitoring Setup
    this.form = this.fb.group({
      rescanDays: ['', [Validators.required, Validators.min(1), Validators.max(90)]],
      preferredTime: ['', Validators.required],
      guidanceEn: ['', Validators.required],
      guidanceTl: ['', Validators.required]
    });

    // 2. Fetch or load the list of diseases for the sidebar
    this.loadDiseases();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.debounceTimers).forEach(clearTimeout);
  }

  // ─── MASTER-DETAIL LOGIC ───

  loadDiseases(): void {
    // In a real app, this would be: this.diseaseService.getDiseases().subscribe(...)
    // Here is dummy data to make your UI work immediately:
    this.diseases = [
      {
        disease_key: 'black_pod_disease',
        name_en: 'Black Pod Disease',
        name_tl: 'Sakit na Itim na Bunga',
        label: 'black_pod_disease_severe'
      },
      {
        disease_key: 'cacao_pod_borer',
        name_en: 'Cacao Pod Borer',
        name_tl: 'Uod sa Bunga ng Kakaw',
        label: 'cacao_pod_borer_mild'
      }
    ];
  }

  selectDisease(disease: DiseasePreviewDto): void {
    this.selectedDisease = disease;

    // Reset state when switching diseases
    this.checklistItems = [];
    this.translating = {};

    // Patch form with existing data (if the disease was already configured)
    this.form.patchValue({
      rescanDays: disease.rescanDays || '',
      preferredTime: disease.preferredTime || '',
      guidanceEn: disease.guidanceEn || '',
      guidanceTl: disease.guidanceTl || ''
    });

    // Load existing checklist items safely
    if (disease.checklist && disease.checklist.length > 0) {
      this.checklistItems = disease.checklist.map(item => ({ ...item }));
    } else {
      // Start with one blank checklist item by default
      this.addChecklist();
    }
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

  // Specialized translation handler for the dynamic checklist arrays ([(ngModel)])
  onBulletEnInput(item: ChecklistItem, sourceKey: 'en', targetKey: 'tl'): void {
    const text = item[sourceKey]?.trim();

    // Create a unique timer key based on the object reference
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

  // ─── SUBMIT LOGIC ───

  onSave(): void {
    // Ensure form is valid and a disease is actually selected
    if (this.form.invalid || !this.selectedDisease) {
      this.form.markAllAsTouched();
      return;
    }

    // Filter out completely empty checklist rows before saving
    const validChecklists = this.checklistItems
      .filter(item => item.en.trim() !== '')
      .map(item => ({
        en: item.en,
        tl: item.tl
      })); // We map it to strip away the UI-only 'translating' boolean property

    const payload = {
      disease_key: this.selectedDisease.disease_key,
      monitoring_setup: {
        rescan_days: this.form.value.rescanDays,
        preferred_time: this.form.value.preferredTime,
        guidance: {
          en: this.form.value.guidanceEn,
          tl: this.form.value.guidanceTl
        },
        checklist: validChecklists
      }
    };

    console.log('Submitting monitoring payload:', payload);
    alert(`Configuration saved successfully for ${this.selectedDisease.name_en}`);

    // Call your service here:
    // this.diseaseService.saveMonitoringConfig(payload).subscribe(...)
  }
}
