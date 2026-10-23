import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FieldReportPdfService,
  ReportSummary,
  OfficialSignatories,
  BarangayDiseaseCount,
} from '../../app/core/services/pdf/field-report-pdf.service';
import { FieldReport } from '../../app/shared/models';

@Component({
  selector: 'app-report-preview-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-3 sm:p-6"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col font-['DM_Sans',sans-serif] text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Field report preview"
        (click)="$event.stopPropagation()"
      >
        <div class="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg sm:text-xl font-semibold m-0">Field report preview</h2>
            <p class="text-sm text-slate-500 m-0 mt-0.5">
              Check the numbers, add the signatories, then generate the PDF.
            </p>
          </div>
          <button
            (click)="close.emit()"
            class="text-sm text-slate-500 hover:text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-green-700"
          >
            Close
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 sm:px-6 py-5 flex flex-col gap-6">
          <section
            class="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-xl border border-slate-200 overflow-hidden"
          >
            <div class="bg-white p-4">
              <p class="text-sm text-slate-500 m-0">Report date</p>
              <p class="text-base sm:text-lg font-semibold m-0 mt-1">{{ summary.reportDate }}</p>
            </div>
            <div class="bg-white p-4">
              <p class="text-sm text-slate-500 m-0">Total scans</p>
              <p class="text-base sm:text-lg font-semibold m-0 mt-1">{{ summary.totalScans }}</p>
            </div>
            <div class="bg-white p-4">
              <p class="text-sm text-slate-500 m-0">Disease cases</p>
              <p class="text-base sm:text-lg font-semibold m-0 mt-1">{{ summary.diseaseCases }}</p>
            </div>
            <div class="bg-white p-4">
              <p class="text-sm text-slate-500 m-0">Barangays</p>
              <p class="text-base sm:text-lg font-semibold m-0 mt-1">
                {{ summary.barangayData.length }}
              </p>
            </div>
          </section>

          @if (summary.diseaseTypes.length > 0) {
            <section>
              <h3 class="text-base font-semibold m-0 mb-2">Diseases detected</h3>
              <ul class="flex flex-wrap gap-2 list-none p-0 m-0">
                @for (disease of summary.diseaseTypes; track disease) {
                  <li class="px-2.5 py-1 rounded-md border border-slate-200 text-sm text-slate-700">
                    {{ disease }}
                  </li>
                }
              </ul>
            </section>
          }

          <section>
            <h3 class="text-base font-semibold m-0 mb-3">Barangay breakdown</h3>
            <div class="flex flex-col gap-4">
              @for (barangay of summary.barangayData; track barangay.barangay) {
                <div class="rounded-xl border border-slate-200 overflow-hidden">
                  <div
                    class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2"
                  >
                    <h4 class="text-sm font-semibold m-0 truncate">{{ barangay.barangay }}</h4>
                    <span class="text-sm text-slate-500 flex-shrink-0">
                      {{ barangay.totalCases }} cases
                    </span>
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full min-w-[420px] text-sm">
                      <thead>
                        <tr class="text-xs font-medium text-slate-500 border-b border-slate-100">
                          <th class="text-left px-4 py-2 font-medium">Disease</th>
                          <th class="text-right px-4 py-2 font-medium">Mild</th>
                          <th class="text-right px-4 py-2 font-medium">Moderate</th>
                          <th class="text-right px-4 py-2 font-medium">Severe</th>
                          <th class="text-right px-4 py-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (disease of getDiseaseKeys(barangay.diseases); track disease) {
                          <tr>
                            <td class="px-4 py-2.5 whitespace-nowrap">{{ disease }}</td>
                            <td class="px-4 py-2.5 text-right text-slate-600">
                              {{ barangay.diseases[disease].mild }}
                            </td>
                            <td class="px-4 py-2.5 text-right text-slate-600">
                              {{ barangay.diseases[disease].moderate }}
                            </td>
                            <td class="px-4 py-2.5 text-right text-slate-600">
                              {{ barangay.diseases[disease].severe }}
                            </td>
                            <td class="px-4 py-2.5 text-right font-medium">
                              {{ barangay.diseases[disease].total }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            </div>
          </section>

          <section>
            <h3 class="text-base font-semibold m-0 mb-3">Official signatories</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="block text-sm font-medium text-slate-700">
                Municipal mayor
                <input
                  type="text"
                  [(ngModel)]="signatories.mayorName"
                  placeholder="Full name"
                  class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal focus-visible:outline-2 focus-visible:outline-green-700"
                  [class.border-red-400]="isSubmitted && !signatories.mayorName"
                />
                @if (isSubmitted && !signatories.mayorName) {
                  <span class="block mt-1 text-sm font-normal text-red-600">
                    Enter the mayor's name.
                  </span>
                }
              </label>

              <label class="block text-sm font-medium text-slate-700">
                Head, Municipal Agriculture Office
                <input
                  type="text"
                  [(ngModel)]="signatories.agricultureHeadName"
                  placeholder="Full name"
                  class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal focus-visible:outline-2 focus-visible:outline-green-700"
                  [class.border-red-400]="isSubmitted && !signatories.agricultureHeadName"
                />
                @if (isSubmitted && !signatories.agricultureHeadName) {
                  <span class="block mt-1 text-sm font-normal text-red-600">
                    Enter the agriculture head's name.
                  </span>
                }
              </label>
            </div>
          </section>
        </div>

        <div
          class="border-t border-slate-200 px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3"
        >
          <button
            (click)="close.emit()"
            class="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-green-700"
          >
            Cancel
          </button>
          <button
            (click)="generatePDF()"
            [disabled]="isGenerating"
            class="px-4 py-2.5 rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-green-700"
          >
            {{ isGenerating ? 'Generating…' : 'Generate PDF report' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class ReportPreviewDialogComponent implements OnInit {
  @Input() reports: FieldReport[] = [];
  @Output() close = new EventEmitter<void>();

  private pdfService = inject(FieldReportPdfService);

  summary!: ReportSummary;
  signatories: OfficialSignatories = {
    mayorName: '',
    agricultureHeadName: '',
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

    if (!this.signatories.mayorName.trim() || !this.signatories.agricultureHeadName.trim()) {
      return;
    }

    this.isGenerating = true;

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
