import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { TranslationService } from './translation.service';
import { DiseaseGuideService } from './disease-guidance.service';
export interface BilingualBullet {
  en: string;
  tl: string;
  translating: boolean;
}
export interface SeveritySection {
  actions: BilingualBullet[];
  prevention: BilingualBullet[];
  escalateEn: string;
  escalateTl: string;
  seekHelpEn?: string;
  seekHelpTl?: string;
}
export interface SeverityData {
  mild: SeveritySection;
  moderate: SeveritySection & { seekHelpEn: string; seekHelpTl: string };
  severe: SeveritySection & { seekHelpEn: string; seekHelpTl: string };
}

export interface ChecklistItem {
  en: string;
  tl: string;
  translating: boolean;
}


function newBullet(): BilingualBullet {
  return { en: '', tl: '', translating: false };
}

function newChecklist(): ChecklistItem {
  return { en: '', tl: '', translating: false };
}

function newSeveritySection(): SeveritySection {
  return {
    actions: [newBullet()],
    prevention: [newBullet()],
    escalateEn: '',
    escalateTl: '',
    seekHelpEn: '',
    seekHelpTl: '',
  };
}

@Component({
  selector: 'app-disease-guidance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './disease-guidance.component.html',

})
export class DiseaseGuidanceComponent implements OnInit, OnDestroy {

  form!: FormGroup;

  activeSev: 'mild' | 'moderate' | 'severe' = 'mild';
  isSaving = false;
  jsonPreview = 'Fill out the form above to generate the JSON config...';
  jsonCopied = false;
  translating: Record<string, boolean> = {};

  detectionLabels: string[] = [
      "black_pod_disease_mild",
      "black_pod_disease_moderate",
      "black_pod_disease_severe",
      "cacao_pod_borer_mild",
      "cacao_pod_borer_moderate",
      "cacao_pod_borer_severe",
      "healthy",
      "mealybug_mild",
      "mealybug_moderate",
      "mealybug_severe",
      "non_cacao"
  ];

  checklistItems: ChecklistItem[] = [newChecklist()];

  sevData: SeverityData = {
    mild: newSeveritySection() as SeverityData['mild'],
    moderate: { ...newSeveritySection(), seekHelpEn: '', seekHelpTl: '' },
    severe: { ...newSeveritySection(), seekHelpEn: '', seekHelpTl: '' },
  };
  private diseaseService = inject(DiseaseGuideService);


  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private destroy$ = new Subject<void>();

  get progressStep(): number {
    const f = this.form?.value;
    if (!f) return 1;
    if (f.nameEn && f.descEn && f.rescanDays && f.guidanceEn) return 4;
    if (f.nameEn && f.descEn && f.rescanDays) return 3;
    if (f.nameEn && f.descEn) return 2;
    return 1;
  }

  constructor(
    private fb: FormBuilder,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nameEn:       ['', Validators.required],
      nameTl:       [''],
      descEn:       ['', Validators.required],
      descTl:       [''],
      rescanDays:   [7, [Validators.required, Validators.min(1), Validators.max(90)]],
      preferredTime:['09:00', Validators.required],
      guidanceEn:   ['', Validators.required],
      guidanceTl:   [''],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.debounceTimers).forEach(clearTimeout);
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
      } catch (err) {
        console.error(`Translation failed for ${targetControlName}:`, err);
      } finally {
        this.translating[targetControlName] = false;
      }
    }, 900);
  }


  selectedLabel: string = '';

onSave() {

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const payload = {

    disease_key: this.form.value.nameEn
      ?.toLowerCase()
      .replace(/\s+/g, '_'),

    display_name: {
      en: this.form.value.nameEn,
      tl: this.form.value.nameTl
    },

    description: {
      en: this.form.value.descEn,
      tl: this.form.value.descTl
    },

    locale: 'en'
  };

  console.log(payload);

  this.diseaseService.createDisease(payload).subscribe({

    next: (response) => {

      console.log('Saved successfully', response);

      alert('Disease saved successfully');

      this.form.reset();
    },

    error: (error) => {

      console.error('Save failed', error);

      alert('Failed to save disease');
    }
  });
}

}
