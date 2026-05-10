import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslationService } from './translation.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-disease-guidance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './disease-guidance.component.html',
    // styleUrls: ['./disease-guidance.component.scss'],

})
export class DiseaseGuidanceComponent implements OnInit, OnDestroy {
  // ── Form ──────────────────────────────────────────────────────────────────

  form!: FormGroup;

  // ── UI state ──────────────────────────────────────────────────────────────

  activeSev: 'mild' | 'moderate' | 'severe' = 'mild';
  isSaving = false;
  jsonPreview = 'Fill out the form above to generate the JSON config...';
  jsonCopied = false;

  // Tracks which fields are currently waiting for a translation response.
  // Keys: form control name (e.g. 'nameTl') or compound key (e.g. 'mild_escalate').
  translating: Record<string, boolean> = {};

  // ── Dynamic lists ─────────────────────────────────────────────────────────

  detectionLabels: string[] = [
    'disease_name_mild',
    'disease_name_moderate',
    'disease_name_severe',
  ];

  checklistItems: ChecklistItem[] = [newChecklist()];

  sevData: SeverityData = {
    mild: newSeveritySection() as SeverityData['mild'],
    moderate: { ...newSeveritySection(), seekHelpEn: '', seekHelpTl: '' },
    severe: { ...newSeveritySection(), seekHelpEn: '', seekHelpTl: '' },
  };

  // ── Internal ──────────────────────────────────────────────────────────────

  /** Debounce timers keyed by target field id. */
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private destroy$ = new Subject<void>();

  // ── Computed ──────────────────────────────────────────────────────────────

  get progressStep(): number {
    const f = this.form?.value;
    if (!f) return 1;
    if (f.nameEn && f.descEn && f.rescanDays && f.guidanceEn) return 4;
    if (f.nameEn && f.descEn && f.rescanDays) return 3;
    if (f.nameEn && f.descEn) return 2;
    return 1;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

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
    // Clear any pending timers
    Object.values(this.debounceTimers).forEach(clearTimeout);
  }

  // ── Translation: Form control fields ──────────────────────────────────────

  /**
   * Called on (input) events for top-level EN form controls.
   * Debounces then fires a translation request.
   *
   * @param sourceControlName  The FormControl that was edited (EN field).
   * @param targetControlName  The FormControl to populate (TL field).
   */
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

  // ── Translation: Bullet / checklist items ─────────────────────────────────

  /**
   * Called on (input) for any EN input inside a BilingualBullet or ChecklistItem.
   *
   * @param item  The object that holds both `en` and `tl` fields plus `translating`.
   * @param enKey The key for the English value (always 'en').
   * @param tlKey The key for the Tagalog value (always 'tl').
   */
  onBulletEnInput(
    item: BilingualBullet | ChecklistItem,
    enKey: 'en',
    tlKey: 'tl'
  ): void {
    const text = (item[enKey] as string)?.trim();

    // Use object reference as a unique timer key
    const timerKey = `bullet_${enKey}_${Math.random()}`;

    // We can't re-use timerKey between calls for the same item, so we store it
    // on the item itself as a hidden property.
    const itemAny = item as any;
    clearTimeout(itemAny.__timer);

    if (!text) {
      item[tlKey] = '';
      return;
    }

    item.translating = true;

    itemAny.__timer = setTimeout(async () => {
      try {
        const translated = await this.translationService.translate(text);
        item[tlKey] = translated;
      } catch (err) {
        console.error('Bullet translation failed:', err);
      } finally {
        item.translating = false;
      }
    }, 900);
  }

  // ── Translation: Single-input severity fields ─────────────────────────────

  /**
   * Called on (input) for severity single-line fields like "When to escalate"
   * and "Seek help guidance".
   *
   * @param event  The native DOM InputEvent.
   * @param sev    The severity level ('mild' | 'moderate' | 'severe').
   * @param field  Which field ('escalate' | 'seekHelp').
   */
  onSingleEnInput(
    event: Event,
    sev: 'mild' | 'moderate' | 'severe',
    field: 'escalate' | 'seekHelp'
  ): void {
    const text = (event.target as HTMLInputElement).value?.trim();
    const timerKey = `${sev}_${field}`;

    clearTimeout(this.debounceTimers[timerKey]);

    if (!text) {
      if (field === 'escalate') this.sevData[sev].escalateTl = '';
      if (field === 'seekHelp') (this.sevData[sev] as any).seekHelpTl = '';
      return;
    }

    this.translating[timerKey] = true;

    this.debounceTimers[timerKey] = setTimeout(async () => {
      try {
        const translated = await this.translationService.translate(text);
        if (field === 'escalate') this.sevData[sev].escalateTl = translated;
        if (field === 'seekHelp') (this.sevData[sev] as any).seekHelpTl = translated;
      } catch (err) {
        console.error(`Single-field translation failed [${timerKey}]:`, err);
      } finally {
        this.translating[timerKey] = false;
      }
    }, 900);
  }

  // ── Dynamic list helpers ──────────────────────────────────────────────────

  addLabel(): void {
    this.detectionLabels.push('');
  }

  removeLabel(index: number): void {
    this.detectionLabels.splice(index, 1);
  }

  addChecklist(): void {
    this.checklistItems.push(newChecklist());
  }

  removeChecklist(index: number): void {
    this.checklistItems.splice(index, 1);
  }

  addBullet(list: BilingualBullet[]): void {
    list.push(newBullet());
  }

  // ── JSON generation ───────────────────────────────────────────────────────

  generatePreview(): void {
    const f = this.form.value;
    const key = (f.nameEn || 'disease_name')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    const config: Record<string, any> = {};
    config[key] = {
      display_name: { en: f.nameEn || '', tl: f.nameTl || '' },
      description:  { en: f.descEn || '', tl: f.descTl || '' },
      monitoring_plan: {
        rescan_after_days:  f.rescanDays || 7,
        preferred_time_hour: parseInt((f.preferredTime || '09:00').split(':')[0], 10),
        message: { en: f.guidanceEn || '', tl: f.guidanceTl || '' },
        checklist: {
          en: this.checklistItems.map(i => i.en).filter(Boolean),
          tl: this.checklistItems.map(i => i.tl).filter(Boolean),
        },
      },
      recommendations: {
        mild:     this.buildSevConfig(this.sevData.mild, false),
        moderate: this.buildSevConfig(this.sevData.moderate, true),
        severe:   this.buildSevConfig(this.sevData.severe, true),
      },
    };

    this.jsonPreview = JSON.stringify(config, null, 2);
  }

  private buildSevConfig(sev: SeveritySection, includeSeekHelp: boolean): Record<string, any> {
    const out: Record<string, any> = {
      what_to_do_now: {
        en: sev.actions.map(a => a.en).filter(Boolean),
        tl: sev.actions.map(a => a.tl).filter(Boolean),
      },
      prevention: {
        en: sev.prevention.map(p => p.en).filter(Boolean),
        tl: sev.prevention.map(p => p.tl).filter(Boolean),
      },
      when_to_escalate: {
        en: sev.escalateEn ? [sev.escalateEn] : [],
        tl: sev.escalateTl ? [sev.escalateTl] : [],
      },
    };
    if (includeSeekHelp && (sev as any).seekHelpEn) {
      out['seek_help'] = {
        en: [(sev as any).seekHelpEn],
        tl: [(sev as any).seekHelpTl || ''],
      };
    }
    return out;
  }

  // ── Copy JSON ─────────────────────────────────────────────────────────────

  copyJson(): void {
    navigator.clipboard.writeText(this.jsonPreview).then(() => {
      this.jsonCopied = true;
      setTimeout(() => (this.jsonCopied = false), 2000);
    });
  }

  // ── Form actions ──────────────────────────────────────────────────────────

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.generatePreview();

    try {
      // ── Replace this block with your actual save logic ──────────────────
      // e.g. await this.diseaseService.save(this.buildPayload());
      await new Promise(resolve => setTimeout(resolve, 800)); // mock delay
      console.log('Saved disease config:', this.jsonPreview);
      // ────────────────────────────────────────────────────────────────────
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      this.isSaving = false;
    }
  }

  onCancel(): void {
    // Navigate back or reset — implement as needed
    this.form.reset({ rescanDays: 7, preferredTime: '09:00' });
    this.detectionLabels = ['disease_name_mild', 'disease_name_moderate', 'disease_name_severe'];
    this.checklistItems = [newChecklist()];
    this.sevData = {
      mild: newSeveritySection() as SeverityData['mild'],
      moderate: { ...newSeveritySection(), seekHelpEn: '', seekHelpTl: '' },
      severe:   { ...newSeveritySection(), seekHelpEn: '', seekHelpTl: '' },
    };
    this.jsonPreview = 'Fill out the form above to generate the JSON config...';
  }
}