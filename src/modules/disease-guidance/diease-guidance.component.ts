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
  form!: FormGroup;
  selectedLabel: string = '';
  translating: Record<string, boolean> = {};

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
      rescanDays: ['', [Validators.required, Validators.min(1)]],
      preferredTime: ['', Validators.required],
      guidanceEn: ['', Validators.required],
      guidanceTl: ['', Validators.required]
    });

    // Start with one empty checklist item in Step 2
    this.addChecklist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.debounceTimers).forEach(clearTimeout);
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

    // Filter out completely empty checklist rows before saving
    const validChecklists = this.checklistItems
      .filter(item => item.en.trim() !== '')
      .map(item => ({ en: item.en, tl: item.tl }));

    // Assemble the complete payload
    // Note: Ensure your DiseaseDto in 'disease-guidance.dto.ts' accepts monitoring_setup if you pass it!
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
        rescan_days: this.form.value.rescanDays,
        preferred_time: this.form.value.preferredTime,
        guidance: {
          en: this.form.value.guidanceEn,
          tl: this.form.value.guidanceTl
        },
        checklist: validChecklists
      }
    };

    console.log('Submitting payload:', payload);

    this.diseaseService.createDisease(payload).subscribe({
      next: (response) => {
        console.log('Disease saved successfully', response);
        alert('Disease saved successfully');

        // Reset the form and wizard state
        this.form.reset();
        this.selectedLabel = '';
        this.checklistItems = [];
        this.addChecklist(); // Add one blank checklist item back
      },
      error: (error) => {
        console.error('Failed to save disease', error);
        alert('Failed to save disease');
      }
    });
  }
}
