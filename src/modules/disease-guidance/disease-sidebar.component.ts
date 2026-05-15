import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiseaseDto } from './disease-guidance.dto';

@Component({
  selector: 'app-disease-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-full lg:w-80 flex-shrink-0 flex flex-col gap-3 sticky top-6">
      <div class="px-2">
        <h2 class="text-lg font-bold text-slate-800">Added Diseases</h2>
        <p class="text-sm text-slate-500">Select a disease to configure monitoring.</p>
      </div>

      <div class="flex flex-col gap-2 mt-2">
        @for (disease of existingRecords; track disease.id) {
          <button
            class="w-full text-left p-4 rounded-xl transition"
            [class.border-2]="selectedDisease?.id === disease.id"
            [class.border-violet-500]="selectedDisease?.id === disease.id"
            [class.bg-violet-50]="selectedDisease?.id === disease.id"
            [class.shadow-sm]="selectedDisease?.id === disease.id"
            [class.border]="selectedDisease?.id !== disease.id"
            [class.border-slate-200]="selectedDisease?.id !== disease.id"
            [class.bg-white]="selectedDisease?.id !== disease.id"
            [class.hover:border-slate-300]="selectedDisease?.id !== disease.id"
            [class.hover:shadow-sm]="selectedDisease?.id !== disease.id"
            (click)="onSelectDisease(disease)"
          >
            <div class="flex justify-between items-start mb-1">
              <h3
                class="font-semibold"
                [class.text-violet-900]="selectedDisease?.id === disease.id"
                [class.text-slate-700]="selectedDisease?.id !== disease.id"
              >
                {{ disease.display_name?.en }}
              </h3>

              @if (selectedDisease?.id === disease.id) {
                <span class="flex h-2 w-2 mt-1.5">
                  <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-violet-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
              }
            </div>

            <p
              class="text-xs mb-2"
              [class.text-violet-600]="selectedDisease?.id === disease.id"
              [class.text-slate-500]="selectedDisease?.id !== disease.id"
            >
              {{ disease.description?.en || 'No description available' }}
            </p>

            <span
              class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold border"
              [class.bg-white]="selectedDisease?.id === disease.id"
              [class.text-violet-700]="selectedDisease?.id === disease.id"
              [class.border-violet-200]="selectedDisease?.id === disease.id"
              [class.bg-slate-100]="selectedDisease?.id !== disease.id"
              [class.text-slate-600]="selectedDisease?.id !== disease.id"
              [class.border-slate-200]="selectedDisease?.id !== disease.id"
            >
              {{ disease.disease_key }}
            </span>
          </button>
        }
      </div>
    </aside>
  `
})
export class DiseaseSidebarComponent {
  @Input() existingRecords: DiseaseDto[] = [];
  @Input() selectedDisease: any = null;

  @Output() diseaseSelected = new EventEmitter<any>();

  onSelectDisease(disease: any): void {
    this.diseaseSelected.emit(disease);
  }
}
