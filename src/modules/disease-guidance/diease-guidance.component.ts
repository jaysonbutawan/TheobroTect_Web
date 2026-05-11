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

  ngOnInit(): void {

    this.form = this.fb.group({

      nameEn: ['', Validators.required],

      nameTl: [''],

      descEn: ['', Validators.required],

      descTl: ['']
    });
  }

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

    Object.values(this.debounceTimers).forEach(clearTimeout);
  }

  onEnInput(
    sourceControlName: string,
    targetControlName: string
  ): void {

    const text = this.form
      .get(sourceControlName)
      ?.value
      ?.trim();

    clearTimeout(this.debounceTimers[targetControlName]);

    if (!text) {

      this.form.get(targetControlName)?.setValue('');

      return;
    }

    this.translating[targetControlName] = true;

    this.debounceTimers[targetControlName] = setTimeout(async () => {

      try {

        const translated =
          await this.translationService.translate(text);

        this.form
          .get(targetControlName)
          ?.setValue(translated);

      } catch (error) {

        console.error(
          `Translation failed for ${targetControlName}`,
          error
        );

      } finally {

        this.translating[targetControlName] = false;
      }

    }, 900);
  }

  onSave(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    const payload: DiseaseDto = {

      disease_key: this.form.value.nameEn
        .toLowerCase()
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

    this.diseaseService
      .createDisease(payload)
      .subscribe({

        next: (response) => {

          console.log(
            'Disease saved successfully',
            response
          );

          alert('Disease saved successfully');

          this.form.reset();

          this.selectedLabel = '';
        },

        error: (error) => {

          console.error(
            'Failed to save disease',
            error
          );

          alert('Failed to save disease');
        }
      });
  }
}
