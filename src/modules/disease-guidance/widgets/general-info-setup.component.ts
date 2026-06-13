import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MonitoringSetupComponent } from './monitoring-setup.component';
import { RecommendationsSetupComponent, SeverityData } from './recommendations-setup.component';
import { GeneralInfoFormComponent } from './general-info-form.component'; // 1. IMPORT NEW CHILD
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-disease-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MonitoringSetupComponent,
    RecommendationsSetupComponent,
    GeneralInfoFormComponent // 1. ADD TO IMPORTS ARRAY
  ],
  templateUrl: './general-info-setup.component.html'
})
export class DiseaseSetupComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() currentEditId: number | null = null;
  @Input() selectedDiseaseKey: string | null = null;
  @Input() editOpenedFromTable = false;
  @Input() sevData!: SeverityData;
  @Input() selectedLabel = '';

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() diseaseKeyChange = new EventEmitter<string>();

  currentStep = 1;
  translating: Record<string, boolean> = {}; // Kept here to feed the child loading states
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  diseaseKeys: string[] = [
    'black_pod_disease',
    'cacao_pod_borer',
    'mealybug',
    'healthy',
    'non_cacao'
  ];

  get isDiseaseContextActive(): boolean {
    return !!this.currentEditId && !!this.selectedDiseaseKey;
  }

  get isSaveDisabled(): boolean {
    return this.form.invalid || !this.selectedLabel;
  }

  setStep(step: number): void {
    if (step > 1 && !this.isDiseaseContextActive) {
      return;
    }
    this.currentStep = step;
  }

  // 2. Modified to handle emissions directly passed from Step 1 child
  onLabelSelectedFromChild(key: string): void {
    this.selectedLabel = key;
    this.diseaseKeyChange.emit(key);
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
      } catch {
        // Fallback catch block
      } finally {
        this.translating[targetControlName] = false;
        this.cdr.markForCheck();
      }
    }, 900);
  }

  onSaveInternal(): void {
    this.save.emit();
  }

  onCancelInternal(): void {
    this.currentStep = 1;
    this.cancel.emit();
  }
}
