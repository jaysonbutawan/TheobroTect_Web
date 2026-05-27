import {
  Component,
  Input,
  inject,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TranslationService } from '../services/translation.service';
import { ChecklistItem } from '../diease-guidance.component';
import { DiseaseSeverityService } from '../services/disease-severity.service';
import { RecommendationSetupService } from '../services/recommendations-setup.service';
import { CreateRecommendationDto, UpdateRecommendationDto } from '../recommendation.dto';

export interface SeverityLevelData {
  actions: ChecklistItem[];
  prevention: ChecklistItem[];
  escalateEn: string;
  escalateTl: string;
  seekHelpEn: string;
  seekHelpTl: string;
}

export interface SeverityData {
  mild: SeverityLevelData;
  moderate: SeverityLevelData;
  severe: SeverityLevelData;
}

type SeverityType = 'mild' | 'moderate' | 'severe';

@Component({
  selector: 'app-recommendations-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recommendations-setup.component.html'
})
export class RecommendationsSetupComponent implements OnChanges, OnInit, OnDestroy {
  @Input({ required: true }) sevData!: SeverityData;
  @Input() diseaseId: number | null = null;
  @Input() diseaseKey: string = '';
  @Input() allowedSeverities: SeverityType[] = ['mild', 'moderate', 'severe'];

  activeSev: SeverityType = 'mild';
  displaySeverities: SeverityType[] = [];
  translating: Record<string, boolean> = {};
  existingSeverities: any[] = [];
  diseaseSeverities: any[] = [];
  isSaving: boolean = false;

  private savedRecommendationIds: Record<string, number> = {};
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private translationService = inject(TranslationService);
  private severityService = inject(DiseaseSeverityService);
  private recommendationService = inject(RecommendationSetupService);
  private cdr = inject(ChangeDetectorRef);

  // ─── Track whether initial load already ran ───────────────────────────────
  private initialLoadDone = false;

  themeMap = {
    mild:     { bg: 'bg-emerald-50/30', border: 'border-emerald-100', text: 'text-emerald-700', dashBorder: 'border-emerald-300', btnHover: 'hover:bg-emerald-50', badgeBg: 'bg-blue-100',   badgeText: 'text-blue-700'   },
    moderate: { bg: 'bg-amber-50/30',   border: 'border-amber-100',   text: 'text-amber-700',   dashBorder: 'border-amber-300',   btnHover: 'hover:bg-amber-50',   badgeBg: 'bg-amber-100',  badgeText: 'text-amber-700'  },
    severe:   { bg: 'bg-red-50/30',     border: 'border-red-100',     text: 'text-red-700',     dashBorder: 'border-red-300',     btnHover: 'hover:bg-red-50',     badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' }
  };

  severityConfig = {
    mild: {
      label: 'Mild', description: 'Early or low-impact signs',
      activeBg: 'bg-emerald-50/40', activeBorder: 'border-emerald-500', activeRing: 'ring-emerald-500/10',
      activeShadow: 'shadow-emerald-100/20', activeText: 'text-emerald-700',
      activeCheckBg: 'bg-emerald-500', activeCheckBorder: 'border-emerald-500', accentBar: 'bg-emerald-500'
    },
    moderate: {
      label: 'Moderate', description: 'Spreading, structural threat',
      activeBg: 'bg-amber-50/40', activeBorder: 'border-amber-500', activeRing: 'ring-amber-500/10',
      activeShadow: 'shadow-amber-100/20', activeText: 'text-amber-700',
      activeCheckBg: 'bg-amber-500', activeCheckBorder: 'border-amber-500', accentBar: 'bg-amber-500'
    },
    severe: {
      label: 'Severe', description: 'Critical, immediate action needed',
      activeBg: 'bg-red-50/40', activeBorder: 'border-red-500', activeRing: 'ring-red-500/10',
      activeShadow: 'shadow-red-100/20', activeText: 'text-red-700',
      activeCheckBg: 'bg-red-500', activeCheckBorder: 'border-red-500', accentBar: 'bg-red-500'
    }
  };

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    console.log(`[RecommendationsSetup] ngOnInit -> diseaseId: ${this.diseaseId}, diseaseKey: "${this.diseaseKey}"`);

    // BUG FIX #1: Only trigger the load if BOTH inputs are already available on init.
    // If one arrives late, ngOnChanges will catch it instead.
    if (this.diseaseId && this.diseaseKey) {
      console.log('[RecommendationsSetup] ngOnInit: Both inputs ready — loading severities.');
      this.initialLoadDone = true;
      this.Severities();
    } else {
      console.warn('[RecommendationsSetup] ngOnInit: Waiting for diseaseId and diseaseKey to both be set.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allowedSeverities']) {
      this.displaySeverities = [...this.allowedSeverities];
      if (!this.displaySeverities.includes(this.activeSev)) {
        this.activeSev = this.displaySeverities[0];
      }
    }

    // BUG FIX #2: Watch ALL changes (including firstChange) so we never miss
    // the window where BOTH inputs become available simultaneously or staggered.
    const idReady  = !!this.diseaseId;
    const keyReady = !!this.diseaseKey;

    const idChanged  = !!changes['diseaseId'];
    const keyChanged = !!changes['diseaseKey'];

    if ((idChanged || keyChanged) && idReady && keyReady) {
      console.log(`[RecommendationsSetup] ngOnChanges: Both inputs synced -> ID: ${this.diseaseId}, Key: "${this.diseaseKey}"`);

      // Avoid double-loading if ngOnInit already handled it
      if (!this.initialLoadDone) {
        this.initialLoadDone = true;
        this.Severities();
      } else if (!changes['diseaseId']?.firstChange || !changes['diseaseKey']?.firstChange) {
        // Re-load only when it is a genuine update (not the very first emission caught by ngOnInit)
        console.log('[RecommendationsSetup] ngOnChanges: Disease changed — reloading.');
        this.initialLoadDone = true;
        this.Severities();
      }
    }
  }

  ngOnDestroy(): void {
    Object.values(this.debounceTimers).forEach(timer => clearTimeout(timer));
  }

  // ─── Severities ────────────────────────────────────────────────────────────

  Severities(): void {
    console.log(`[RecommendationsSetup] Severities(): Fetching for diseaseId=${this.diseaseId}`);

    this.severityService.getSeverities().subscribe({
      next: (res: any) => {
        this.existingSeverities = res?.data ?? res ?? [];

        // BUG FIX #3: Ensure numeric comparison (backend may return strings)
        this.diseaseSeverities = this.existingSeverities.filter(
          (sev: any) => Number(sev.disease_id) === Number(this.diseaseId)
        );

        console.log(`[RecommendationsSetup] Severities(): diseaseSeverities found:`, this.diseaseSeverities);

        const fetchedLevels = this.diseaseSeverities
          .map((sev: any) =>
            (sev.severity_level || sev.severity || sev.level || sev.name || '').toLowerCase()
          )
          .filter((val: string) => ['mild', 'moderate', 'severe'].includes(val)) as SeverityType[];

        this.displaySeverities = fetchedLevels;
        console.log(`[RecommendationsSetup] Severities(): displaySeverities resolved to:`, this.displaySeverities);

        if (this.displaySeverities.length > 0 && !this.displaySeverities.includes(this.activeSev)) {
          this.activeSev = this.displaySeverities[0];
        }

        // BUG FIX #4: diseaseSeverities is now populated — safe to load recommendations
        this.loadExistingRecommendations();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[RecommendationsSetup] Severities(): Failed to fetch severities', err);
        this.displaySeverities = [];
        this.cdr.markForCheck();
      }
    });
  }

  onSeveritySelect(severity: SeverityType): void {
    if (this.displaySeverities.includes(severity)) {
      this.activeSev = severity;
    }
  }

  // ─── Save ──────────────────────────────────────────────────────────────────

  onSaveRecommendations(): void {
    if (!this.diseaseKey || !this.diseaseId) {
      console.error('[onSaveRecommendations] Aborted: diseaseKey or diseaseId is missing.', {
        diseaseKey: this.diseaseKey,
        diseaseId: this.diseaseId
      });
      return;
    }

    console.log(`[onSaveRecommendations] Starting save for key="${this.diseaseKey}", id=${this.diseaseId}`);
    console.log('[onSaveRecommendations] Current savedRecommendationIds (upsert map):', { ...this.savedRecommendationIds });

    this.isSaving = true;

    this.saveRecommendationsForDisease(this.diseaseKey)
      .then(() => {
        console.log('[onSaveRecommendations] ✅ All recommendations saved successfully.');
      })
      .catch(err => {
        console.error('[onSaveRecommendations] ❌ Error saving recommendations:', err);
      })
      .finally(() => {
        this.isSaving = false;
        this.cdr.markForCheck();
      });
  }

  // ─── Bullets ───────────────────────────────────────────────────────────────

  addBullet(list: ChecklistItem[]): void {
    list.push({ en: '', tl: '', translating: false });
  }

  removeBullet(list: ChecklistItem[], index: number): void {
    list.splice(index, 1);
  }

  onBulletEnInput(item: ChecklistItem, sourceKey: 'en', targetKey: 'tl'): void {
    const text = item[sourceKey]?.trim();

    // BUG FIX #5: Use a STABLE key so clearTimeout actually cancels the previous timer.
    // Math.random() as a key means the old timer is never found and never cleared —
    // every keystroke fires a translation request.
    const timerKey = `bullet_${item}`;   // object reference as stable identity

    if (!text) {
      item[targetKey] = '';
      return;
    }

    item.translating = true;
    clearTimeout(this.debounceTimers[timerKey]);

    this.debounceTimers[timerKey] = setTimeout(async () => {
      try {
        const translated = await this.translationService.translate(text);
        item[targetKey] = translated;
        console.log(`[onBulletEnInput] Translated "${text}" -> "${translated}"`);
      } catch (error) {
        console.error('[onBulletEnInput] Translation failed:', error);
      } finally {
        item.translating = false;
        this.cdr.markForCheck();
      }
    }, 900);
  }

  onSingleEnInput(event: Event, severity: SeverityType, field: 'escalate' | 'seekHelp'): void {
    const target = event.target as HTMLInputElement;
    const text = target.value.trim();
    const targetField = `${field}Tl` as keyof SeverityLevelData;
    const translatingKey = `${severity}_${field}`;

    clearTimeout(this.debounceTimers[translatingKey]);

    if (!text) {
      (this.sevData[severity][targetField] as string) = '';
      return;
    }

    this.translating[translatingKey] = true;

    this.debounceTimers[translatingKey] = setTimeout(async () => {
      try {
        const translated = await this.translationService.translate(text);
        (this.sevData[severity][targetField] as string) = translated;
        console.log(`[onSingleEnInput] ${translatingKey} translated -> "${translated}"`);
      } catch (error) {
        console.error(`[onSingleEnInput] Translation failed for ${translatingKey}:`, error);
      } finally {
        this.translating[translatingKey] = false;
        this.cdr.markForCheck();
      }
    }, 900);
  }

  // ─── Core upsert logic ─────────────────────────────────────────────────────

  async saveRecommendationsForDisease(diseaseKey: string): Promise<void> {
    if (!this.diseaseId) {
      console.error('[saveRecommendations] Aborted: no diseaseId.');
      return;
    }

    // Build severityId lookup map from already-fetched diseaseSeverities
    const severityIdMap: Record<string, number> = {};
    this.diseaseSeverities.forEach(sev => {
      const level = (sev.severity_level || sev.severity || sev.level || sev.name || '')
        .toLowerCase().trim();
      if (['mild', 'moderate', 'severe'].includes(level)) {
        severityIdMap[level] = sev.id;
      }
    });

    console.log('[saveRecommendations] severityIdMap:', severityIdMap);
    console.log('[saveRecommendations] displaySeverities to process:', this.displaySeverities);

    for (const severity of this.displaySeverities) {
      const severityId = severityIdMap[severity];

      if (!severityId) {
        console.warn(`[saveRecommendations] ⚠️ No DB id for severity "${severity}" — skipping.`);
        continue;
      }

      const data = this.sevData[severity];
      if (!data) {
        console.warn(`[saveRecommendations] ⚠️ No sevData for "${severity}" — skipping.`);
        continue;
      }

      console.log(`[saveRecommendations] Processing severity="${severity}" (id=${severityId})`);

      if (data.actions?.length) {
        await this.upsertRecommendationItem(diseaseKey, severityId, 'action_items',    data.actions,  0);
      }
      if (data.prevention?.length) {
        await this.upsertRecommendationItem(diseaseKey, severityId, 'prevention_items', data.prevention, 1);
      }
      if (data.escalateEn?.trim()) {
        await this.upsertRecommendationItem(diseaseKey, severityId, 'escalate_text',
          { en: data.escalateEn, tl: data.escalateTl || '' }, 2);
      }
      if (data.seekHelpEn?.trim()) {
        await this.upsertRecommendationItem(diseaseKey, severityId, 'seek_help_text',
          { en: data.seekHelpEn, tl: data.seekHelpTl || '' }, 3);
      }
    }

    console.log('[saveRecommendations] ✅ Finished all severities.');
  }

 private async upsertRecommendationItem(
    diseaseKey: string,
    severityId: number,
    categoryKey: string,
    content: any,
    sortOrder: number
  ): Promise<void> {
    const mapKey    = `${severityId}_${categoryKey}`;
    const existingId = this.savedRecommendationIds[mapKey];

    console.log(`[upsert] mapKey="${mapKey}" | existingId=${existingId ?? 'NONE (will CREATE)'}`);

    try {
      if (existingId) {
        // ── UPDATE ────────────────────────────────────────────────────────────
        const updateDto: UpdateRecommendationDto = {
          category_key: categoryKey,
          content,
          sort_order: sortOrder,
          locale: null
        };

        console.log(`[upsert] PUT -> id=${existingId}`, updateDto);
        await firstValueFrom(this.recommendationService.updateRecommendation(existingId, updateDto));
        console.log(`[upsert] ✅ Updated "${categoryKey}" for severityId=${severityId}`);

      } else {
        // ── CREATE ────────────────────────────────────────────────────────────

        // Check if the disease key is 'healthy' or 'non_cacao'. If not, force it to null.
        const finalDiseaseKey = (diseaseKey === 'healthy' || diseaseKey === 'non_cacao')
          ? diseaseKey
          : null;

        const createDto: CreateRecommendationDto = {
          disease_key: finalDiseaseKey as any, // Cast to 'any' to bypass strict TS rules if DTO expects only string
          disease_severity_id: severityId,
          category_key: categoryKey,
          content,
          sort_order: sortOrder,
          locale: null
        };

        console.log(`[upsert] POST -> new record`, createDto);
        const response = await firstValueFrom(this.recommendationService.createRecommendation(createDto));

        // BUG FIX #6: Guard against missing id in response — log it clearly
        if (response?.id) {
          this.savedRecommendationIds[mapKey] = response.id;
          console.log(`[upsert] ✅ Created "${categoryKey}" for severityId=${severityId} — stored id=${response.id}`);
        } else {
          console.error(`[upsert] ❌ Created "${categoryKey}" but response had no id! Cannot track for future updates.`, response);
        }
      }
    } catch (err) {
      console.error(`[upsert] ❌ Failed for "${categoryKey}" (severityId=${severityId}):`, err);
      throw err;
    }
  }
  // ─── Load existing ─────────────────────────────────────────────────────────

async loadExistingRecommendations(): Promise<void> {
    if (!this.diseaseKey || !this.diseaseId) {
      console.warn('[loadExistingRecommendations] Aborted: missing diseaseKey or diseaseId.', {
        diseaseKey: this.diseaseKey,
        diseaseId: this.diseaseId
      });
      return;
    }

    console.group(`[loadExistingRecommendations] Disease="${this.diseaseKey}" (ID: ${this.diseaseId})`);

    try {
      const response: any = await firstValueFrom(
        this.recommendationService.getRecommendations(this.diseaseId)
      );

      const diseaseRecommendations: any[] = response?.data ?? response ?? [];
      console.log(`[loadExistingRecommendations] Raw records from API (${diseaseRecommendations.length}):`, diseaseRecommendations);

      // Build severityId -> SeverityType map
      const severityIdToLevelMap: Record<number, SeverityType> = {};
      this.diseaseSeverities.forEach((sev: any) => {
        const level = (sev.severity_level || sev.severity || sev.level || sev.name || '')
          .toLowerCase().trim();
        if (['mild', 'moderate', 'severe'].includes(level)) {
          severityIdToLevelMap[sev.id] = level as SeverityType;
        }
      });

      // Reset state before applying fetched data
      this.savedRecommendationIds = {};
      this.displaySeverities.forEach(level => {
        if (this.sevData[level]) {
          this.sevData[level].actions    = [];
          this.sevData[level].prevention = [];
          this.sevData[level].escalateEn = '';
          this.sevData[level].escalateTl = '';
          this.sevData[level].seekHelpEn = '';
          this.sevData[level].seekHelpTl = '';
        }
      });

      // Populate UI state and record IDs for future upsert
      diseaseRecommendations.forEach((rec: any) => {
        if (!rec.disease_severity_id) {
          return;
        }

        const level = severityIdToLevelMap[rec.disease_severity_id];

        if (!level || !this.sevData[level]) {
          return;
        }

        const mapKey = `${rec.disease_severity_id}_${rec.category_key}`;
        this.savedRecommendationIds[mapKey] = rec.id;

        let parsedContent = rec.content;
        if (typeof parsedContent === 'string') {
          try {
            parsedContent = JSON.parse(parsedContent);
          } catch {
            // fail silently for invalid json
          }
        }

        switch (rec.category_key) {
          case 'action_items':
            this.sevData[level].actions = Array.isArray(parsedContent) ? parsedContent : [];
            break;
          case 'prevention_items':
            this.sevData[level].prevention = Array.isArray(parsedContent) ? parsedContent : [];
            break;
          case 'escalate_text':
            this.sevData[level].escalateEn = parsedContent?.en || '';
            this.sevData[level].escalateTl = parsedContent?.tl || '';
            break;
          case 'seek_help_text':
            this.sevData[level].seekHelpEn = parsedContent?.en || '';
            this.sevData[level].seekHelpTl = parsedContent?.tl || '';
            break;
        }
      });

      // ─── START OF NEW SUMMARY LOG ───
      const summary: Record<string, any> = {};
      this.displaySeverities.forEach(level => {
        summary[level] = {
          'Actions (Count)': this.sevData[level].actions.length,
          'Prevention (Count)': this.sevData[level].prevention.length,
          'Has Escalate Text?': !!this.sevData[level].escalateEn ? '✅ Yes' : '❌ No',
          'Has Seek Help Text?': !!this.sevData[level].seekHelpEn ? '✅ Yes' : '❌ No',
        };
      });

      console.log('%c🎯 FETCHED RECOMMENDATIONS SUMMARY', 'color: #10b981; font-weight: bold; font-size: 14px;');
      console.table(summary);
      console.log('[loadExistingRecommendations] Upsert Tracking IDs:', { ...this.savedRecommendationIds });
      // ─── END OF NEW SUMMARY LOG ───

      this.cdr.markForCheck();

    } catch (error) {
      console.error('[loadExistingRecommendations] ❌ Failed:', error);
    } finally {
      console.groupEnd();
    }
  }
}
