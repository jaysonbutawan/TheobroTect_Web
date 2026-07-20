import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scan, Severity } from './user_scan_history.component'; // Adjust import path

@Component({
  selector: 'app-scan-detail-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 select-none" (click)="close.emit()">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
    (click)="$event.stopPropagation()">

    <!-- Header -->
    <div class="bg-[#2e7d32] rounded-t-2xl px-6 py-5 flex items-start justify-between">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[1px] text-green-300 mb-1">Scan Report</p>
        <h2 class="text-[18px] font-extrabold text-white leading-tight" style="font-family:'Syne',sans-serif">
          {{ scan.disease }}
        </h2>
        <p class="text-[12px] text-green-200 mt-1 font-mono">Pod ID: {{ scan.pod_id }}</p>
      </div>
      <div class="flex items-center gap-3 ml-4 flex-shrink-0">
        <span
          class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.6px] border rounded-full px-3 py-1.5"
          [ngClass]="{
                'bg-green-100 text-green-800 border-green-300': scan.severity === 'Mild',
                'bg-amber-100 text-amber-800 border-amber-300': scan.severity === 'Moderate',
                'bg-red-100 text-red-700 border-red-300':       scan.severity === 'Severe'
              }">
          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{
                  'bg-green-600': scan.severity === 'Mild',
                  'bg-amber-500': scan.severity === 'Moderate',
                  'bg-red-500':   scan.severity === 'Severe'
                }"></span>
          {{ scan.severity }}
        </span>
        <button (click)="close.emit()"
          class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-3 divide-x divide-[#f0f4f8] border-b border-[#f0f4f8] bg-[#f8fafc]">
      <div class="px-5 py-3.5 text-center">
        <p class="text-[10px] font-bold uppercase tracking-[0.8px] text-slate-400 mb-1">AI Confidence</p>
        <p class="text-[20px] font-extrabold leading-none" style="font-family:'Syne',sans-serif" [ngClass]="{
                'text-[#2e7d32]': scan.severity === 'Mild',
                'text-amber-500': scan.severity === 'Moderate',
                'text-red-500':   scan.severity === 'Severe'
              }">{{ formatConf(scan.confidence) }}%</p>
      </div>
      <div class="px-5 py-3.5 text-center">
        <p class="text-[10px] font-bold uppercase tracking-[0.8px] text-slate-400 mb-1">Scan Date</p>
        <p class="text-[13px] font-bold text-slate-800">{{ formatDate(scan.scanned_at) }}</p>
        <p class="text-[11px] text-slate-400">{{ formatTime(scan.scanned_at) }}</p>
      </div>
      <div class="px-5 py-3.5 text-center">
        <p class="text-[10px] font-bold uppercase tracking-[0.8px] text-slate-400 mb-1">Location</p>
        <p class="text-[13px] font-bold text-slate-800">{{ scan.location }}</p>
      </div>
    </div>

    <div class="px-6 py-5 space-y-5">

      <!-- Condition details -->
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.9px] text-slate-400 mb-2">About this condition</p>
        <p class="text-[13px] text-slate-600 leading-relaxed">{{ scan.description }}</p>
      </div>

      <!-- Confidence Breakdown -->
      @if (sortedScores && sortedScores.length > 0) {
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.9px] text-slate-400 mb-3">AI Confidence Breakdown</p>
          <div class="space-y-2">
            @for (score of sortedScores; track score[0]) {
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-[12px] text-slate-600">{{ score[0] }}</span>
                <span class="text-[12px] font-bold text-slate-700">{{ score[1] | number:'1.1-1' }}%</span>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" [style.width.%]="score[1]" [ngClass]="{
                          'bg-[#2e7d32]': score[0] === scan.disease,
                          'bg-slate-300': score[0] !== scan.disease
                        }"></div>
              </div>
            </div>
            }
          </div>
        </div>
      }

      <div class="h-px bg-[#f0f4f8]"></div>

      <!-- Actions -->
      @if (scan.actions && scan.actions.length > 0) {
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div
              class="w-6 h-6 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                stroke-width="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p class="text-[12px] font-bold uppercase tracking-[0.9px] text-slate-700">What to do now</p>
          </div>
          <ul class="space-y-2">
            @for (action of scan.actions; track action) {
            <li class="flex items-start gap-2.5 text-[13px] text-slate-600 leading-relaxed">
              <span class="w-5 h-5 rounded-full bg-[#2e7d32] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {{ action }}
            </li>
            }
          </ul>
        </div>
      }

      <div class="h-px bg-[#f0f4f8]"></div>

      <!-- Monitoring Plan -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div
            class="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p class="text-[12px] font-bold uppercase tracking-[0.9px] text-slate-700">Monitoring Plan</p>
        </div>

        <div class="rounded-xl border px-4 py-3 mb-4" [ngClass]="{
                'bg-green-50 border-green-100': scan.severity === 'Mild',
                'bg-amber-50 border-amber-100': scan.severity === 'Moderate',
                'bg-red-50 border-red-100':     scan.severity === 'Severe'
              }">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-3.5 h-3.5" [ngClass]="{
                    'text-[#2e7d32]': scan.severity === 'Mild',
                    'text-amber-500': scan.severity === 'Moderate',
                    'text-red-500':   scan.severity === 'Severe'
                  }" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span class="text-[11px] font-bold uppercase tracking-[0.8px]" [ngClass]="{
                    'text-[#2e7d32]': scan.severity === 'Mild',
                    'text-amber-600': scan.severity === 'Moderate',
                    'text-red-600':   scan.severity === 'Severe'
                  }">
              @if (scan.severity === 'Severe') { Urgent — }
              Rescan recommended
            </span>
          </div>
          <p class="text-[12.5px] text-slate-600 leading-relaxed">
            @if (scan.severity === 'Mild') {
              Rescan after <strong>7 days</strong> to check if symptoms are improving.
            } @else if (scan.severity === 'Moderate') {
              Rescan after <strong>5 days</strong> to confirm spread is controlled.
            } @else {
              Rescan after <strong>3 days</strong> and consider contacting an agriculturist if symptoms persist.
            }
          </p>
        </div>

        <p class="text-[11px] font-bold uppercase tracking-[0.8px] text-slate-400 mb-2">Monitoring checklist</p>
        <ul class="space-y-2">
          @for (item of monitoringChecklist(scan.severity); track item) {
          <li class="flex items-start gap-2.5 text-[12.5px] text-slate-600">
            <svg class="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
              viewBox="0 0 24 24" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            {{ item }}
          </li>
          }
        </ul>
      </div>

      <div class="h-px bg-[#f0f4f8]"></div>

      <!-- Scan History -->
      @if (scan.history && scan.history.length > 0) {
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                stroke-width="2">
                <polyline points="12 8 12 12 14 14" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <p class="text-[12px] font-bold uppercase tracking-[0.9px] text-slate-700">Scan History</p>
          </div>
          <div class="space-y-2">
            @for (entry of scan.history; track entry.date) {
            <div class="flex items-center justify-between bg-[#f8fafc] border border-[#f0f4f8] rounded-xl px-4 py-2.5">
              <div class="flex items-center gap-2.5">
                <span class="w-2 h-2 rounded-full flex-shrink-0" [ngClass]="{
                          'bg-[#2e7d32]': entry.severity === 'Mild',
                          'bg-amber-400': entry.severity === 'Moderate',
                          'bg-red-500':   entry.severity === 'Severe'
                        }"></span>
                <span class="text-[12.5px] font-semibold text-slate-700">{{ entry.disease }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[10px] font-bold uppercase tracking-[0.6px] px-2 py-0.5 rounded-full border" [ngClass]="{
                          'bg-green-50 text-green-700 border-green-200': entry.severity === 'Mild',
                          'bg-amber-50 text-amber-700 border-amber-200': entry.severity === 'Moderate',
                          'bg-red-50 text-red-600 border-red-200':       entry.severity === 'Severe'
                        }">{{ entry.severity }}</span>
                <span class="text-[11px] text-slate-400 font-mono">{{ formatDate(entry.date) }}</span>
              </div>
            </div>
            }
          </div>
        </div>
      }

      <div class="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <div class="flex items-start gap-2.5">
          <svg class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p class="text-[11.5px] text-amber-800 leading-relaxed">
            Guidance is based on standard integrated pest management (IPM) practices. Always consult your local
            DA/municipal agriculturist for approved products, correct rates, and safety rules.
          </p>
        </div>
      </div>

    </div>

    <!-- Modal Footer -->
    <div class="px-6 py-4 border-t border-[#f0f4f8] bg-[#f8fafc] rounded-b-2xl flex items-center justify-between gap-3">
      <button (click)="close.emit()"
        class="px-5 py-2 text-[12.5px] font-semibold text-slate-600 bg-white border border-[#e2e8f0] rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
        Close
      </button>
      @if (scan.severity === 'Moderate' || scan.severity === 'Severe') {
        <div class="flex items-center gap-2 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <svg class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Consult your local DA/municipal agriculturist
        </div>
      }
    </div>

  </div>
</div>
  `,
})
export class ScanDetailWidgetComponent {
  @Input({ required: true }) scan!: Scan;
  @Input({ required: true }) sortedScores!: [string, number][];
  @Output() close = new EventEmitter<void>();

  // ── Modal Specific Logic ──────────────────────────────────
  monitoringChecklist(severity: Severity): string[] {
    switch (severity) {
      case 'Mild':
        return [
          'Check if the dark lesions / damage stopped spreading.',
          'Check for new symptoms on the same tree.',
          'Ensure fallen or infected pods were removed from the area.',
        ];
      case 'Moderate':
        return [
          'Check nearby trees for new lesions or damage.',
          'Confirm sanitation and tool cleaning were completed.',
          'Check drainage and water pooling after rain.',
        ];
      case 'Severe':
      default:
        return [
          'Check if new pods are getting infected quickly.',
          'Confirm infected material was removed and destroyed/buried.',
          'Check humidity/shade; prune if canopy is too dense.',
        ];
    }
  }

  // ── Formatters (Needed for the Modal View) ─────────────────
  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatConf(value: number): string {
    return value.toFixed(1);
  }
}
