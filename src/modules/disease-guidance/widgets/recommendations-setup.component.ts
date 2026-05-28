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

  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private translationService = inject(TranslationService);
  private severityService = inject(DiseaseSeverityService);
  private recommendationService = inject(RecommendationSetupService);
  private cdr = inject(ChangeDetectorRef);

  private initialLoadDone = false;

  themeMap = {
    mild: { bg: 'bg-emerald-50/30', border: 'border-emerald-100', text: 'text-emerald-700', dashBorder: 'border-emerald-300', btnHover: 'hover:bg-emerald-50', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
    moderate: { bg: 'bg-amber-50/30', border: 'border-amber-100', text: 'text-amber-700', dashBorder: 'border-amber-300', btnHover: 'hover:bg-amber-50', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
    severe: { bg: 'bg-red-50/30', border: 'border-red-100', text: 'text-red-700', dashBorder: 'border-red-300', btnHover: 'hover:bg-red-50', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' }
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

    const idReady = !!this.diseaseId;
    const keyReady = !!this.diseaseKey;

    const idChanged = !!changes['diseaseId'];
    const keyChanged = !!changes['diseaseKey'];

    if ((idChanged || keyChanged) && idReady && keyReady) {
      console.log(`[RecommendationsSetup] ngOnChanges: Both inputs synced -> ID: ${this.diseaseId}, Key: "${this.diseaseKey}"`);

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

  Severities(): void {
    console.log(`[RecommendationsSetup] Severities(): Fetching for diseaseId=${this.diseaseId}`);

    this.severityService.getSeverities().subscribe({
      next: (res: any) => {
        this.existingSeverities = res?.data ?? res ?? [];

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

    const timerKey = `bullet_${item}`;

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

  async saveRecommendationsForDisease(
    diseaseKey: string
  ): Promise<void> {

    if (!this.diseaseId) {
      console.error('[saveRecommendations] No diseaseId found.');
      return;
    }

    const severityIdMap: Record<string, number> = {};

    this.diseaseSeverities.forEach(sev => {

      const level = (
        sev.severity_level ||
        sev.severity ||
        sev.level ||
        ''
      ).toLowerCase().trim();

      severityIdMap[level] = sev.id;
    });

    console.log('[saveRecommendations] severityIdMap:', severityIdMap);

    /**
     * Process each severity
     */
    for (const severity of this.displaySeverities) {

      const severityId = severityIdMap[severity];

      if (!severityId) {
        console.warn(
          `[saveRecommendations] No severityId for "${severity}"`
        );
        continue;
      }

      const data = this.sevData[severity];

      if (!data) {
        console.warn(
          `[saveRecommendations] No data for "${severity}"`
        );
        continue;
      }

      const recommendations: any[] = [];

      if (data.actions?.length) {

        recommendations.push({
          category_key: 'action_items',
          content: data.actions,
          sort_order: 0
        });
      }
      if (data.prevention?.length) {

        recommendations.push({
          category_key: 'prevention_items',
          content: data.prevention,
          sort_order: 1
        });
      }
      if (data.escalateEn?.trim()) {

        recommendations.push({
          category_key: 'escalate_text',
          content: {
            en: data.escalateEn,
            tl: data.escalateTl || ''
          },
          sort_order: 2
        });
      }
      if (data.seekHelpEn?.trim()) {

        recommendations.push({
          category_key: 'seek_help_text',
          content: {
            en: data.seekHelpEn,
            tl: data.seekHelpTl || ''
          },
          sort_order: 3
        });
      }
      if (!recommendations.length) {
        console.warn(
          `[saveRecommendations] Empty recommendations for "${severity}"`
        );
        continue;
      }

      console.log(
        `[saveRecommendations] Saving severity="${severity}"`,
        recommendations
      );

      await firstValueFrom(
        this.recommendationService.saveRecommendations({
          disease_severity_id: severityId,
          recommendations
        })
      );

      console.log(
        `[saveRecommendations] Saved severity="${severity}"`
      );
    }

    console.log('[saveRecommendations] DONE');
  }

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

      const severityIdToLevelMap: Record<number, SeverityType> = {};
      this.diseaseSeverities.forEach((sev: any) => {
        const level = (sev.severity_level || sev.severity || sev.level || sev.name || '')
          .toLowerCase().trim();
        if (['mild', 'moderate', 'severe'].includes(level)) {
          severityIdToLevelMap[sev.id] = level as SeverityType;
        }
      });

      this.displaySeverities.forEach(level => {
        if (this.sevData[level]) {
          this.sevData[level].actions = [];
          this.sevData[level].prevention = [];
          this.sevData[level].escalateEn = '';
          this.sevData[level].escalateTl = '';
          this.sevData[level].seekHelpEn = '';
          this.sevData[level].seekHelpTl = '';
        }
      });

      diseaseRecommendations.forEach((rec: any) => {
        if (!rec.disease_severity_id) {
          return;
        }

        const level = severityIdToLevelMap[rec.disease_severity_id];

        if (!level || !this.sevData[level]) {
          return;
        }

        const mapKey = `${rec.disease_severity_id}_${rec.category_key}`;

        let parsedContent = rec.content;
        if (typeof parsedContent === 'string') {
          try {
            parsedContent = JSON.parse(parsedContent);
          } catch {
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
      this.cdr.markForCheck();

    } catch (error) {
      console.error('[loadExistingRecommendations] ❌ Failed:', error);
    } finally {
      console.groupEnd();
    }
  }
}
