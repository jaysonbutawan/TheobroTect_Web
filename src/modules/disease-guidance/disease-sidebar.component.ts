import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiseaseDto } from './disease-guidance.dto';

@Component({
  selector: 'app-disease-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="min-h-screen bg-white relative overflow-hidden font-sans">

  <div class="absolute top-0 left-0 w-[600px] h-[600px] bg-green-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
  <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

  <aside class="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6 sticky top-6 p-4 lg:p-6 relative z-10">

    <div class="px-1">
      <div class="flex items-center justify-between mb-1.5">
        <h2 class="text-xl font-semibold tracking-tight text-slate-800">Added Diseases</h2>
        <span class="text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/80 shadow-sm">
          {{ existingRecords.length }}
        </span>
      </div>
      <p class="text-sm text-slate-500 font-medium">Select a disease to configure parameters</p>
    </div>

    <div class="flex flex-col gap-3 mt-1 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar pb-6">
      @for (disease of existingRecords; track disease.id) {
        <button
          class="group relative w-full text-left p-5 rounded-2xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-green-500/20 backdrop-blur-xl"
          [class]="
            selectedDisease?.id === disease.id
              ? 'bg-white/80 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50 translate-x-1'
              : 'bg-white/40 border border-white/60 shadow-sm hover:bg-white/60 hover:shadow-[0_8px_20px_rgb(0,0,0,0.02)] hover:border-white'
          "
          (click)="onSelectDisease(disease)"
        >
          <div class="flex justify-between items-start mb-2.5">
            <div class="flex-1 pr-3">
              <h3
                class="font-semibold text-[15px] tracking-tight transition-colors"
                [class.text-slate-900]="selectedDisease?.id === disease.id"
                [class.text-slate-700]="selectedDisease?.id !== disease.id"
              >
                {{ disease.display_name!.en }}
              </h3>
            </div>

            @if (selectedDisease?.id === disease.id) {
              <div class="flex items-center justify-center w-5 h-5 bg-green-600 rounded-full shadow-sm shadow-green-600/20 flex-shrink-0">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            } @else {
              <div class="w-5 h-5 rounded-full border-2 border-slate-200 bg-white/50 group-hover:border-green-400 transition-colors flex-shrink-0"></div>
            }
          </div>

          <p
            class="text-[13px] mb-5 leading-relaxed line-clamp-2 transition-colors"
            [class.text-slate-500]="selectedDisease?.id !== disease.id"
            [class.text-slate-600]="selectedDisease?.id === disease.id"
          >
            {{ disease.description!.en || 'No description available' }}
          </p>

          <div class="flex items-center justify-between">
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase backdrop-blur-sm transition-colors"
              [class.bg-green-50]="selectedDisease?.id === disease.id"
              [class.text-green-700]="selectedDisease?.id === disease.id"
              [class.border]="selectedDisease?.id === disease.id"
              [class.border-green-100]="selectedDisease?.id === disease.id"

              [class.bg-white/50]="selectedDisease?.id !== disease.id"
              [class.text-slate-500]="selectedDisease?.id !== disease.id"
              [class.border-white/60]="selectedDisease?.id !== disease.id"
            >
              {{ disease.disease_key }}
            </span>

            <span
              class="text-[12px] font-medium transition-all duration-300"
              [class.text-green-600]="selectedDisease?.id === disease.id"
              [class.opacity-100]="selectedDisease?.id === disease.id"
              [class.text-slate-400]="selectedDisease?.id !== disease.id"
              [class.opacity-0]="selectedDisease?.id !== disease.id"
              [class.group-hover:opacity-100]="selectedDisease?.id !== disease.id"
            >
              {{ selectedDisease?.id === disease.id ? 'Configuring' : 'Configure →' }}
            </span>
          </div>
        </button>
      }

      @if (existingRecords.length === 0) {
        <div class="text-center py-12 px-4 rounded-2xl backdrop-blur-xl bg-white/40 border border-white/60 shadow-sm">
          <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/60 shadow-sm border border-white flex items-center justify-center">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-slate-700 mb-1">No diseases added</h3>
          <p class="text-[13px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">Add diseases from the library to begin monitoring.</p>
        </div>
      }
    </div>
  </aside>
</div>

<style>
  /* Minimal, soft custom scrollbar to match the design */
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.2); /* Soft slate-400 */
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.4);
  }
</style>
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
