import { Component, Input, inject,  SimpleChanges,
  OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslationService } from './translation.service';
import { ChecklistItem } from './diease-guidance.component';
import { DiseaseSeverityService } from './disease-severity.service';
import { CreateDiseaseSeverityDto } from './disease-guidance.dto';

@Component({
  selector: 'app-monitoring-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div [formGroup]="form" class="space-y-6">

  <div>
    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3 ml-1">
      Select Target Severity Level
    </label>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        type="button"
        (click)="activeSev = 'mild'"
        class="flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-4"
        [class]="
          activeSev === 'mild'
            ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/10 focus:ring-emerald-500/20'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 focus:ring-slate-500/10'
        "
      >
        <div
          class="w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 flex-shrink-0"
          [class]="
            activeSev === 'mild'
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'bg-white border-slate-300 group-hover:border-slate-400'
          "
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" *ngIf="activeSev === 'mild'">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <span class="block text-sm font-semibold transition-colors" [class]="activeSev === 'mild' ? 'text-emerald-700' : 'text-slate-700'">
            Mild Severity
          </span>
          <span class="block text-xs text-slate-400 mt-0.5 font-normal">Early or low-impact signs</span>
        </div>
      </button>

      <button
        type="button"
        (click)="activeSev = 'moderate'"
        class="flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-4"
        [class]="
          activeSev === 'moderate'
            ? 'bg-amber-50/40 border-amber-500 shadow-sm ring-2 ring-amber-500/10 focus:ring-amber-500/20'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 focus:ring-slate-500/10'
        "
      >
        <div
          class="w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 flex-shrink-0"
          [class]="
            activeSev === 'moderate'
              ? 'bg-amber-500 border-amber-500 text-white'
              : 'bg-white border-slate-300 group-hover:border-slate-400'
          "
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" *ngIf="activeSev === 'moderate'">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <span class="block text-sm font-semibold transition-colors" [class]="activeSev === 'moderate' ? 'text-amber-700' : 'text-slate-700'">
            Moderate Severity
          </span>
          <span class="block text-xs text-slate-400 mt-0.5 font-normal">Spreading, structural threat</span>
        </div>
      </button>

      <button
        type="button"
        (click)="activeSev = 'severe'"
        class="flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-4"
        [class]="
          activeSev === 'severe'
            ? 'bg-red-50/40 border-red-500 shadow-sm ring-2 ring-red-500/10 focus:ring-red-500/20'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 focus:ring-slate-500/10'
        "
      >
        <div
          class="w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 flex-shrink-0"
          [class]="
            activeSev === 'severe'
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-white border-slate-300 group-hover:border-slate-400'
          "
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" *ngIf="activeSev === 'severe'">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <span class="block text-sm font-semibold transition-colors" [class]="activeSev === 'severe' ? 'text-red-700' : 'text-slate-700'">
            Severe Level
          </span>
          <span class="block text-xs text-slate-400 mt-0.5 font-normal">Critical, immediate action needed</span>
        </div>
      </button>
    </div>
  </div>

  <section class="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
    <div class="flex items-start gap-3 mb-6">
      <span class="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50 text-violet-600 text-xs font-bold">02</span>
      <div>
        <h2 class="text-base font-semibold text-slate-800">Monitoring Setup</h2>
        <p class="text-sm text-slate-500 mt-0.5">Rescan schedule and field worker instructions.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Rescan Interval (Days) <span class="text-red-500">*</span>
        </label>
        <input
          type="number"
          class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-200"
          formControlName="rescanDays"
          placeholder="7"
          min="1"
          max="90"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Preferred Scan Time <span class="text-red-500">*</span>
        </label>
        <input
          aria-label="Preferred Scan Time"
          type="time"
          class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-200"
          formControlName="preferredTime"
        />
      </div>

      <div class="col-span-1 md:col-span-2 flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
          <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">EN</span>
          Guidance Message <span class="text-red-500">*</span>
        </label>
        <textarea
          class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-200 resize-none"
          formControlName="guidanceEn"
          rows="2"
          placeholder="Instruction for the field worker, e.g. 'Rescan after 7 days to check if symptoms are improving.'"
          (input)="onEnInput('guidanceEn', 'guidanceTl')"
        ></textarea>
      </div>

      <div class="col-span-1 md:col-span-2 flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
          <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">TL</span>
          Mensahe sa Filipino <span class="text-red-500">*</span>

          <span class="ml-auto flex items-center gap-1 text-[10px] font-normal text-violet-500 normal-case tracking-normal" *ngIf="translating['guidanceTl']">
            <span class="w-2.5 h-2.5 border border-violet-400 border-t-transparent rounded-full animate-spin"></span>
            Nagsasalin...
          </span>
          <span class="ml-auto text-[10px] font-normal text-emerald-500 normal-case tracking-normal" *ngIf="!translating['guidanceTl'] && form.get('guidanceTl')?.value">
            Auto-translated
          </span>
        </label>
        <textarea
          class="w-full px-3 py-2 text-sm rounded-lg border border-amber-200 bg-amber-50/30 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all duration-200 resize-none"
          formControlName="guidanceTl"
          rows="2"
          placeholder="Awtomatikong isasalin..."
          [class.opacity-60]="translating['guidanceTl']"
        ></textarea>
      </div>
    </div>
  </section>
</div>
  `
})
export class MonitoringSetupComponent implements OnChanges {
  @Input({ required: true }) form!: FormGroup;
  @Input() checklistItems: ChecklistItem[] = [];
  @Input() diseaseId: number | null = null;

  activeSev: 'mild' | 'moderate' | 'severe' = 'mild';

  // Cached severities from backend
  existingSeverities: any[] = [];

  translating: Record<string, boolean> = {};
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  private translationService = inject(TranslationService);
  private severityService = inject(DiseaseSeverityService);

  ngOnChanges(changes: SimpleChanges): void {

    console.log('[MonitoringSetup] ngOnChanges triggered:', changes);

    // Refetch whenever disease changes
    if (changes['diseaseId'] && this.diseaseId) {

      console.log(
        `[MonitoringSetup] Active Disease ID changed -> ${this.diseaseId}`
      );

      this.fetchSeverities();
    }
  }

  // ─────────────────────────────────────────────
  // FETCH ALL EXISTING SEVERITIES
  // ─────────────────────────────────────────────
fetchSeverities(): void {

  console.log(
    `[MonitoringSetup] Fetching severities for Disease ID: ${this.diseaseId}`
  );

  this.severityService.getSeverities().subscribe({

    next: (res: any) => {

      this.existingSeverities = res?.data ?? res ?? [];

      console.log(
        '[MonitoringSetup] All Severities:',
        this.existingSeverities
      );

      // Filter ONLY current disease
      const diseaseSeverities = this.existingSeverities.filter(
        (sev: any) => Number(sev.disease_id) === Number(this.diseaseId)
      );

      console.log(
        `[MonitoringSetup] Existing for Disease ${this.diseaseId}:`,
        diseaseSeverities
      );

      // ✅ AUTO CHECK ALL REQUIRED SEVERITIES
      this.autoCreateMissingSeverities(diseaseSeverities);
    },

    error: (err) => {
      console.error('[MonitoringSetup] Failed to fetch severities:', err);
    }
  });
}
  private autoCreateMissingSeverities(diseaseSeverities: any[]): void {

  const requiredSeverities: Array<'mild' | 'moderate' | 'severe'> = [
    'mild',
    'moderate',
    'severe'
  ];

  requiredSeverities.forEach(level => {

    const exists = diseaseSeverities.some(
      (sev: any) =>
        sev.severity_level?.toLowerCase() === level.toLowerCase()
    );

    if (!exists) {

      console.log(
        `[MonitoringSetup] Missing "${level}" → Creating for disease ${this.diseaseId}`
      );

    const diseaseId = this.diseaseId;

if (!diseaseId) return;

const payload: CreateDiseaseSeverityDto = {
  disease_id: diseaseId,
  severity_level: level
};

      this.severityService.createSeverity(payload).subscribe({

        next: (res: any) => {

          console.log(
            `[MonitoringSetup] Auto-created "${level}" severity`,
            res
          );

          this.existingSeverities.push(res?.data ?? res);
        },

        error: (err) => {
          console.error(
            `[MonitoringSetup] Failed auto-creating "${level}"`,
            err
          );
        }
      });

    } else {

      console.log(
        `[MonitoringSetup] "${level}" already exists for this disease`
      );
    }
  });
}

  // ─────────────────────────────────────────────
  // AUTO CREATE IF NOT EXIST
  // ─────────────────────────────────────────────
  onSeveritySelect(
    level: 'mild' | 'moderate' | 'severe'
  ): void {

    console.log(
      `[MonitoringSetup] Severity Selected -> ${level}`
    );

    this.activeSev = level;

    if (!this.diseaseId) {

      console.warn(
        '[MonitoringSetup] Cannot create severity. No disease selected.'
      );

      return;
    }

    console.log(
      `[MonitoringSetup] Checking if "${level}" already exists for Disease ID ${this.diseaseId}`
    );

    // IMPORTANT:
    // your backend uses severity_level
    // not level
    const matchExists = this.existingSeverities.some(
      (sev: any) =>
        sev.disease_id === this.diseaseId &&
        sev.severity_level === level
    );

    console.log(
      `[MonitoringSetup] Severity Exists? -> ${matchExists}`
    );

    // IF NOT EXIST → CREATE
    if (!matchExists) {

      console.log(
        `[MonitoringSetup] "${level}" severity NOT FOUND. Creating now...`
      );

      // Match backend validation structure
      const payload = {
        disease_id: this.diseaseId,
        severity_level: level
      };

      console.log(
        '[MonitoringSetup] Create Severity Payload:',
        payload
      );

      this.severityService.createSeverity(payload).subscribe({

        next: (res: any) => {

          console.log(
            '[MonitoringSetup] Create Severity API Response:',
            res
          );

          const newlyCreated = res?.data ?? res;

          this.existingSeverities.push(newlyCreated);

          console.log(
            `[MonitoringSetup] "${level}" severity successfully created.`,
            newlyCreated
          );

          console.log(
            '[MonitoringSetup] Updated Cached Severities:',
            this.existingSeverities
          );
        },

        error: (err) => {

          console.error(
            `[MonitoringSetup] Failed creating "${level}" severity.`,
            err
          );
        }
      });

    } else {

      console.log(
        `[MonitoringSetup] "${level}" severity already exists. No creation needed.`
      );
    }
  }

  formatLabel(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  onEnInput(
    sourceControlName: string,
    targetControlName: string
  ): void {
    /* your implementation */
  }
}
