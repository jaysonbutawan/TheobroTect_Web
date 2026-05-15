import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslationService } from './translation.service';
import { ChecklistItem } from './diease-guidance.component'; 

@Component({
  selector: 'app-monitoring-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <!-- We wrap the section in [formGroup]="form" to link it to the parent's form -->
    <div [formGroup]="form">
      <section class="px-8 py-7">
        <div class="flex items-start gap-3 mb-6">
          <span class="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50 text-violet-600 text-xs font-bold">02</span>
          <div>
            <h2 class="text-base font-semibold text-slate-800">Monitoring Setup</h2>
            <p class="text-sm text-slate-500 mt-0.5">Rescan schedule and field worker instructions.</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-x-5 gap-y-5">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Rescan Interval (Days) <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition"
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
              aria-label="reaw"
              type="time"
              class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition"
              formControlName="preferredTime"
            />
          </div>

          <!-- Guidance EN -->
          <div class="col-span-2 flex flex-col gap-1.5">
            <label class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">EN</span>
              Guidance Message <span class="text-red-500">*</span>
            </label>
            <textarea
              class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition resize-none"
              formControlName="guidanceEn"
              rows="2"
              placeholder="Instruction for the field worker, e.g. 'Rescan after 7 days to check if symptoms are improving.'"
              (input)="onEnInput('guidanceEn', 'guidanceTl')"
            ></textarea>
          </div>

          <!-- Guidance TL -->
          <div class="col-span-2 flex flex-col gap-1.5">
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
              class="w-full px-3 py-2 text-sm rounded-lg border border-amber-200 bg-amber-50/30 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition resize-none"
              formControlName="guidanceTl"
              rows="2"
              placeholder="Awtomatikong isasalin..."
              [class.opacity-60]="translating['guidanceTl']"
            ></textarea>
          </div>
        </div>

        <!-- Monitoring Checklist -->
        <div class="mt-6">
          <label class="flex flex-col gap-0.5 text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
            Monitoring Checklist
            <span class="font-normal normal-case tracking-normal text-slate-400">Tasks field workers should check before rescanning.</span>
          </label>

          <div class="flex flex-col gap-2">
            <div class="rounded-lg border border-slate-200 overflow-hidden bg-white" *ngFor="let item of checklistItems; let i = index">
              <div class="flex items-center gap-0">
                <div class="flex items-center gap-2 flex-1 px-3 py-2 border-r border-slate-200">
                  <span class="flex-shrink-0 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">EN</span>
                  <input
                    type="text"
                    class="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                    [(ngModel)]="checklistItems[i].en"
                    [ngModelOptions]="{ standalone: true }"
                    placeholder="Checklist item in English..."
                    (input)="onBulletEnInput(checklistItems[i], 'en', 'tl')"
                  />
                </div>
                <div class="flex items-center gap-2 flex-1 px-3 py-2">
                  <span class="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
                    TL
                    <span class="w-2 h-2 border border-amber-500 border-t-transparent rounded-full animate-spin" *ngIf="checklistItems[i].translating"></span>
                  </span>
                  <input
                    type="text"
                    class="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                    [(ngModel)]="checklistItems[i].tl"
                    [ngModelOptions]="{ standalone: true }"
                    placeholder="Awtomatikong isasalin..."
                    [class.opacity-50]="checklistItems[i].translating"
                  />
                </div>
                <button
                  aria-label="remove"
                  type="button"
                  class="flex-shrink-0 w-8 h-full flex items-center justify-center border-l border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                  (click)="removeChecklist(i)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition"
            (click)="addChecklist()"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5v14" />
            </svg>
            Add Checklist Item
          </button>
        </div>
      </section>
    </div>
  `
})
export class MonitoringSetupComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() checklistItems: ChecklistItem[] = [];

  translating: Record<string, boolean> = {};
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private translationService = inject(TranslationService);

  // ─── CHECKLIST LOGIC ───
  addChecklist(): void {
    this.checklistItems.push({ en: '', tl: '', translating: false });
  }

  removeChecklist(index: number): void {
    this.checklistItems.splice(index, 1);
  }

  // ─── TRANSLATION LOGIC FOR GUIDANCE & BULLETS ───
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
}
