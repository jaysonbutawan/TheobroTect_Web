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

import { TranslationService } from './translation.service';
import { ChecklistItem } from './diease-guidance.component';
import { DiseaseSeverityService } from './disease-severity.service';
import { RecommendationSetupService } from './recommendations-setup.service';
import { CreateRecommendationDto, UpdateRecommendationDto } from './recommendation.dto';

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
  @Input() diseaseKey: string = ''; // ✅ ADD THIS
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

  themeMap = {
    mild: { bg: 'bg-emerald-50/30', border: 'border-emerald-100', text: 'text-emerald-700', dashBorder: 'border-emerald-300', btnHover: 'hover:bg-emerald-50', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
    moderate: { bg: 'bg-amber-50/30', border: 'border-amber-100', text: 'text-amber-700', dashBorder: 'border-amber-300', btnHover: 'hover:bg-amber-50', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
    severe: { bg: 'bg-red-50/30', border: 'border-red-100', text: 'text-red-700', dashBorder: 'border-red-300', btnHover: 'hover:bg-red-50', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' }
  };

  severityConfig = {
    mild: {
      label: 'Mild',
      description: 'Early or low-impact signs',
      activeBg: 'bg-emerald-50/40',
      activeBorder: 'border-emerald-500',
      activeRing: 'ring-emerald-500/10',
      activeShadow: 'shadow-emerald-100/20',
      activeText: 'text-emerald-700',
      activeCheckBg: 'bg-emerald-500',
      activeCheckBorder: 'border-emerald-500',
      accentBar: 'bg-emerald-500'
    },
    moderate: {
      label: 'Moderate',
      description: 'Spreading, structural threat',
      activeBg: 'bg-amber-50/40',
      activeBorder: 'border-amber-500',
      activeRing: 'ring-amber-500/10',
      activeShadow: 'shadow-amber-100/20',
      activeText: 'text-amber-700',
      activeCheckBg: 'bg-amber-500',
      activeCheckBorder: 'border-amber-500',
      accentBar: 'bg-amber-500'
    },
    severe: {
      label: 'Severe',
      description: 'Critical, immediate action needed',
      activeBg: 'bg-red-50/40',
      activeBorder: 'border-red-500',
      activeRing: 'ring-red-500/10',
      activeShadow: 'shadow-red-100/20',
      activeText: 'text-red-700',
      activeCheckBg: 'bg-red-500',
      activeCheckBorder: 'border-red-500',
      accentBar: 'bg-red-500'
    }
  };

  ngOnInit(): void {
    if (this.diseaseId) {
      this.Severities();
    }
  }

 ngOnChanges(changes: SimpleChanges): void {
    if (changes['allowedSeverities']) {
      this.displaySeverities = [...this.allowedSeverities];

      if (!this.displaySeverities.includes(this.activeSev)) {
        this.activeSev = this.displaySeverities[0];
      }
    }

    // ✅ Listen for changes to EITHER diseaseId or diseaseKey
    const diseaseIdChanged = changes['diseaseId'] && !changes['diseaseId'].firstChange;
    const diseaseKeyChanged = changes['diseaseKey'] && !changes['diseaseKey'].firstChange;

    if (diseaseIdChanged || diseaseKeyChanged) {
      if (this.diseaseId && this.diseaseKey) {
        console.log(
          `[RecommendationsSetup] Disease sync complete -> ID: ${this.diseaseId}, Key: "${this.diseaseKey}"`
        );
        this.Severities();
      }
    }
  }

  ngOnDestroy(): void {
    Object.values(this.debounceTimers).forEach(timer => clearTimeout(timer));
  }

  Severities(): void {
    this.severityService.getSeverities().subscribe({
      next: (res: any) => {
        this.existingSeverities = res?.data ?? res ?? [];
        this.diseaseSeverities = this.existingSeverities.filter(
          (sev: any) => Number(sev.disease_id) === Number(this.diseaseId)
        );

        const fetchedLevels = this.diseaseSeverities
          .map((sev: any) =>
            (sev.severity_level || sev.severity || sev.level || sev.name || '')
              .toLowerCase()
          )
          .filter(
            (val: string) =>
              ['mild', 'moderate', 'severe'].includes(val)
          ) as SeverityType[];
        this.displaySeverities = fetchedLevels;

        if (
          this.displaySeverities.length > 0 &&
          !this.displaySeverities.includes(this.activeSev)
        ) {
          this.activeSev = this.displaySeverities[0];
        }
        this.loadExistingRecommendations();
        this.cdr.markForCheck();
      },
      error: () => {
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

  onSaveRecommendations() {
    const diseaseKey = this.diseaseKey;
    this.isSaving = true;

    this.saveRecommendationsForDisease(diseaseKey).then(() => {
      console.log('Successfully saved all recommendations.');
    }).catch(err => {
      console.error('Error saving recommendations', err);
    }).finally(() => {
      this.isSaving = false;
      this.cdr.markForCheck();
    });
  }

  addBullet(list: ChecklistItem[]): void {
    list.push({ en: '', tl: '', translating: false });
  }

  removeBullet(list: ChecklistItem[], index: number): void {
    list.splice(index, 1);
  }

  onBulletEnInput(item: ChecklistItem, sourceKey: 'en', targetKey: 'tl'): void {
    const text = item[sourceKey]?.trim();
    const timerKey = `bullet_${Math.random()}`;

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
      } catch (error) {
        console.error('Translation failed', error);
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
      } catch (error) {
        console.error(`Translation failed for ${translatingKey}`, error);
      } finally {
        this.translating[translatingKey] = false;
        this.cdr.markForCheck();
      }
    }, 900);
  }

  async saveRecommendationsForDisease(diseaseKey: string): Promise<void> {
    if (!this.diseaseId) {
      console.error('[saveRecommendations] No disease ID provided.');
      return;
    }

    const severityIdMap: Record<string, number> = {};
    this.diseaseSeverities.forEach(sev => {
      const level = (sev.severity_level || sev.severity || sev.level || sev.name || '')
        .toLowerCase()
        .trim();
      if (['mild', 'moderate', 'severe'].includes(level)) {
        severityIdMap[level] = sev.id;
      }
    });

    for (const severity of this.displaySeverities) {
      const severityId = severityIdMap[severity];
      if (!severityId) {
        console.warn(`[saveRecommendations] No severity DB id for "${severity}" – skipping.`);
        continue;
      }

      const data = this.sevData[severity];
      if (!data) continue;

      // 1. Action items
      if (data.actions && data.actions.length) {
        await this.upsertRecommendationItem(
          diseaseKey,
          severityId,
          'action_items',
          data.actions,
          0
        );
      }

      // 2. Prevention items
      if (data.prevention && data.prevention.length) {
        await this.upsertRecommendationItem(
          diseaseKey,
          severityId,
          'prevention_items',
          data.prevention,
          1
        );
      }

      // 3. Escalate text
      if (data.escalateEn?.trim()) {
        await this.upsertRecommendationItem(
          diseaseKey,
          severityId,
          'escalate_text',
          { en: data.escalateEn, tl: data.escalateTl || '' },
          2
        );
      }

      // 4. Seek help text
      if (data.seekHelpEn?.trim()) {
        await this.upsertRecommendationItem(
          diseaseKey,
          severityId,
          'seek_help_text',
          { en: data.seekHelpEn, tl: data.seekHelpTl || '' },
          3
        );
      }
    }

    console.log('[saveRecommendations] All recommendations saved successfully.');
  }

  private async upsertRecommendationItem(
    diseaseKey: string,
    severityId: number,
    categoryKey: string,
    content: any,
    sortOrder: number
  ): Promise<void> {
    const mapKey = `${severityId}_${categoryKey}`;
    const existingId = this.savedRecommendationIds[mapKey];

    try {
      if (existingId) {
        // UPDATE Existing Data (PUT)
        const updateDto: UpdateRecommendationDto = {
          category_key: categoryKey,
          content: content,
          sort_order: sortOrder,
          locale: null
        };

        await firstValueFrom(
          this.recommendationService.updateRecommendation(existingId, updateDto)
        );
        console.log(`[saveRecommendations] Updated ${categoryKey} for severity ${severityId}`);

      } else {
        // CREATE New Data (POST)
        const createDto: CreateRecommendationDto = {
          disease_key: diseaseKey,
          disease_severity_id: severityId,
          category_key: categoryKey,
          content: content,
          sort_order: sortOrder,
          locale: null
        };

        const response = await firstValueFrom(
          this.recommendationService.createRecommendation(createDto)
        );

        if (response && response.id) {
          this.savedRecommendationIds[mapKey] = response.id;
        }

        console.log(`[saveRecommendations] Created ${categoryKey} for severity ${severityId}`);
      }
    } catch (err) {
      console.error(`[saveRecommendations] Failed to upsert ${categoryKey}:`, err);
      throw err;
    }
  }
async loadExistingRecommendations(): Promise<void> {
    // 1. Safety check to ensure we have both keys
    if (!this.diseaseKey || !this.diseaseId) {
      console.warn('⚠️ [RecommendationsSetup] loadExistingRecommendations aborted: missing diseaseKey or diseaseId.');
      return;
    }

    console.group(`[RecommendationsSetup] Loading Data for: "${this.diseaseKey}" (ID: ${this.diseaseId})`);

    try {
      // 2. Fetch ONLY the recommendations for this specific disease ID
      const response: any = await firstValueFrom(
        this.recommendationService.getRecommendations(this.diseaseId)
      );

      // 3. Since the backend filtered it, all returned data belongs to this disease
      const diseaseRecommendations = response?.data ?? response ?? [];
      console.log(`🔹 Fetched strictly filtered recommendations from API:`, diseaseRecommendations);

      // 4. Create a reverse map to easily find which SeverityType (mild/moderate/severe)
      // corresponds to a given database severity ID.
      const severityIdToLevelMap: Record<number, SeverityType> = {};
      this.diseaseSeverities.forEach((sev: any) => {
        const level = (sev.severity_level || sev.severity || sev.level || sev.name || '')
          .toLowerCase()
          .trim();
        if (['mild', 'moderate', 'severe'].includes(level)) {
          severityIdToLevelMap[sev.id] = level as SeverityType;
        }
      });
      console.log(`🔹 Valid Severity IDs mapping for this disease:`, severityIdToLevelMap);

      // 5. Reset previous tracking IDs and UI state so switching diseases doesn't mix data
      this.savedRecommendationIds = {};
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

      console.log(`🔹 Mapping matched recommendations to UI State:`);

      // 6. Loop through the backend-filtered recommendations and populate the UI state
      diseaseRecommendations.forEach((rec: any) => {
        if (!rec.disease_severity_id) return;

        const level = severityIdToLevelMap[rec.disease_severity_id];

        if (level && this.sevData[level]) {
          console.log(`   ✅ Matched [${rec.category_key}] -> Severity [${level}] (ID: ${rec.disease_severity_id})`);

          console.log(`      ↳ Raw Content Type:`, typeof rec.content);
          console.log(`      ↳ Is Array?:`, Array.isArray(rec.content));
          console.log(`      ↳ Raw Content Value:`, rec.content);

          const mapKey = `${rec.disease_severity_id}_${rec.category_key}`;
          this.savedRecommendationIds[mapKey] = rec.id;

          let parsedContent = rec.content;
          if (typeof parsedContent === 'string') {
            try {
              parsedContent = JSON.parse(parsedContent);
              console.log(`      ↳ ⚠️ Content was a string. Successfully parsed into JSON:`, parsedContent);
            } catch (e) {
              console.warn(`      ↳ ❌ Content is a string but NOT valid JSON. Cannot parse.`);
            }
          }

          switch (rec.category_key) {
            case 'action_items':
              this.sevData[level].actions = Array.isArray(parsedContent) ? parsedContent : [];
              console.log(`      ↳ Set actions to:`, this.sevData[level].actions);
              break;
            case 'prevention_items':
              this.sevData[level].prevention = Array.isArray(parsedContent) ? parsedContent : [];
              console.log(`      ↳ Set prevention to:`, this.sevData[level].prevention);
              break;
            case 'escalate_text':
              this.sevData[level].escalateEn = parsedContent?.en || '';
              this.sevData[level].escalateTl = parsedContent?.tl || '';
              console.log(`      ↳ Set escalateEn: "${this.sevData[level].escalateEn}"`);
              break;
            case 'seek_help_text':
              this.sevData[level].seekHelpEn = parsedContent?.en || '';
              this.sevData[level].seekHelpTl = parsedContent?.tl || '';
              console.log(`      ↳ Set seekHelpEn: "${this.sevData[level].seekHelpEn}"`);
              break;
          }
        } else {
          console.warn(`   ❌ Ignored [${rec.category_key}] (Severity ID: ${rec.disease_severity_id}) - Not mapped to active disease.`);
        }
      });

      console.log(`🚀 FINAL STATE OF THIS.SEVDATA BEFORE UI RENDER:`, JSON.parse(JSON.stringify(this.sevData)));

      this.cdr.markForCheck();
      console.log('✅ [RecommendationsSetup] Successfully finished applying recommendations.');

    } catch (error) {
      console.error('❌ [RecommendationsSetup Error] Failed to load existing recommendations:', error);
    } finally {
      console.groupEnd();
    }
  }
}
