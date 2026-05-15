import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from './translation.service';
import { ChecklistItem } from './diease-guidance.component';

// Interfaces for structured data
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

@Component({
  selector: 'app-recommendations-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recommendations-setup.component.html'
})
export class RecommendationsSetupComponent {
  @Input({ required: true }) sevData!: SeverityData;

  activeSev: 'mild' | 'moderate' | 'severe' = 'mild';
  translating: Record<string, boolean> = {};

  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private translationService = inject(TranslationService);

  // ─── ADD/REMOVE LIST ITEMS ───
  addBullet(list: ChecklistItem[]): void {
    list.push({ en: '', tl: '', translating: false });
  }

  removeBullet(list: ChecklistItem[], index: number): void {
    list.splice(index, 1);
  }

  // ─── TRANSLATE ARRAY ITEMS (Actions, Prevention) ───
  onBulletEnInput(item: ChecklistItem, sourceKey: 'en', targetKey: 'tl'): void {
    const text = item[sourceKey]?.trim();

    // Create a unique timer key based on object reference
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
      }
    }, 900);
  }

  // ─── TRANSLATE SINGLE INPUTS (Escalate, Seek Help) ───
  onSingleEnInput(event: Event, severity: 'mild' | 'moderate' | 'severe', field: 'escalate' | 'seekHelp'): void {
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
      }
    }, 900);
  }
}
