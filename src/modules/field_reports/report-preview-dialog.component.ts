import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  FieldReportPdfService, 
  ReportSummary, 
  OfficialSignatories,
  BarangayDiseaseCount
} from '../../app/core/services/pdf/field-report-pdf.service';
import { FieldReport } from '../../app/shared/models';

@Component({
  selector: 'app-report-preview-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div 
  class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  (click)="onBackdropClick($event)"
>
  <div 
    class="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
    (click)="$event.stopPropagation()"
  >
    <!-- Header -->
    <div class="bg-gradient-to-r from-[#3D683A] to-[#2d4f2a] text-white px-6 py-4 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-black">Field Report Preview</h2>
        <p class="text-white/80 text-sm">Review and generate PDF report</p>
      </div>
      <button
        (click)="close.emit()"
        class="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
        aria-label="Close"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Report Summary -->
      <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
        <h3 class="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#3D683A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Report Summary
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-4 border border-slate-200">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Report Date</p>
            <p class="text-lg font-black text-slate-800">{{ summary.reportDate }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-200">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Total Cases</p>
            <p class="text-lg font-black text-[#3D683A]">{{ summary.totalReports }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-200">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Barangays</p>
            <p class="text-lg font-black text-slate-800">{{ summary.barangayData.length }}</p>
          </div>
        </div>
      </div>

      <!-- Disease Types -->
      @if (summary.diseaseTypes.length > 0) {
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <h3 class="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            Disease Types Detected
          </h3>
          <div class="flex flex-wrap gap-2">
            @for (disease of summary.diseaseTypes; track disease) {
              <span class="px-3 py-1.5 bg-white rounded-lg text-sm font-semibold text-slate-700 border border-amber-200">
                {{ disease }}
              </span>
            }
          </div>
        </div>
      }

      <!-- Barangay Data Preview -->
      <div class="space-y-4">
        <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#3D683A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Barangay Breakdown
        </h3>

        @for (barangay of summary.barangayData; track barangay.barangay) {
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <!-- Barangay Header -->
            <div class="bg-gradient-to-r from-[#3D683A] to-[#2d4f2a] text-white px-4 py-3 flex items-center justify-between">
              <h4 class="font-bold text-base">{{ barangay.barangay }}</h4>
              <span class="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                {{ barangay.totalCases }} cases
              </span>
            </div>

            <!-- Disease Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="text-left px-4 py-2 font-bold text-slate-600">Disease</th>
                    <th class="text-center px-4 py-2 font-bold text-slate-600">Mild</th>
                    <th class="text-center px-4 py-2 font-bold text-slate-600">Moderate</th>
                    <th class="text-center px-4 py-2 font-bold text-slate-600">Severe</th>
                    <th class="text-center px-4 py-2 font-bold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (disease of getDiseaseKeys(barangay.diseases); track disease) {
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="px-4 py-3 font-medium text-slate-700">{{ disease }}</td>
                      <td class="text-center px-4 py-3">
                        <span class="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-lg font-semibold text-xs">
                          {{ barangay.diseases[disease].mild }}
                        </span>
                      </td>
                      <td class="text-center px-4 py-3">
                        <span class="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg font-semibold text-xs">
                          {{ barangay.diseases[disease].moderate }}
                        </span>
                      </td>
                      <td class="text-center px-4 py-3">
                        <span class="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-lg font-semibold text-xs">
                          {{ barangay.diseases[disease].severe }}
                        </span>
                      </td>
                      <td class="text-center px-4 py-3">
                        <span class="font-bold text-slate-800">
                          {{ barangay.diseases[disease].total }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <!-- Official Signatories Form -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <h3 class="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
          Official Signatories
        </h3>
        <div class="space-y-4">
          <!-- Mayor Name -->
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">
              Municipal Mayor
              <span class="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="signatories.mayorName"
              placeholder="Enter mayor's full name"
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#3D683A] focus:outline-none transition-colors font-medium"
              [class.border-red-300]="isSubmitted && !signatories.mayorName"
            />
            @if (isSubmitted && !signatories.mayorName) {
              <p class="text-red-500 text-xs mt-1 font-semibold">Mayor's name is required</p>
            }
          </div>

          <!-- Agriculture Head Name -->
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">
              Head, Municipal Agriculture Office
              <span class="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="signatories.agricultureHeadName"
              placeholder="Enter agriculture head's full name"
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#3D683A] focus:outline-none transition-colors font-medium"
              [class.border-red-300]="isSubmitted && !signatories.agricultureHeadName"
            />
            @if (isSubmitted && !signatories.agricultureHeadName) {
              <p class="text-red-500 text-xs mt-1 font-semibold">Agriculture head's name is required</p>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between gap-4">
      <button
        (click)="close.emit()"
        class="px-6 py-3 rounded-xl font-bold text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-100 transition-colors"
      >
        Cancel
      </button>
      <button
        (click)="generatePDF()"
        [disabled]="isGenerating"
        class="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#3D683A] to-[#2d4f2a] hover:from-[#2d4f2a] hover:to-[#3D683A] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        @if (isGenerating) {
          <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        } @else {
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Generate PDF Report
        }
      </button>
    </div>
  </div>
</div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ReportPreviewDialogComponent implements OnInit {
  @Input() reports: FieldReport[] = [];
  @Output() close = new EventEmitter<void>();

  private pdfService = inject(FieldReportPdfService);

  summary!: ReportSummary;
  signatories: OfficialSignatories = {
    mayorName: '',
    agricultureHeadName: ''
  };
  
  isSubmitted = false;
  isGenerating = false;

  ngOnInit(): void {
    this.summary = this.pdfService.aggregateReportData(this.reports);
  }

  getDiseaseKeys(diseases: BarangayDiseaseCount['diseases']): string[] {
    return Object.keys(diseases).sort();
  }

  generatePDF(): void {
    this.isSubmitted = true;

    // Validate
    if (!this.signatories.mayorName.trim() || !this.signatories.agricultureHeadName.trim()) {
      return;
    }

    this.isGenerating = true;

    // Simulate slight delay for UX
    setTimeout(() => {
      this.pdfService.generatePDF(this.summary, this.signatories);
      this.isGenerating = false;
      this.close.emit();
    }, 500);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
