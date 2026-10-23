import { Injectable } from '@angular/core';
import { Scan } from '../../app/shared/models';
import { DiseaseCounts, FilterState } from './heatmap.models';

@Injectable({ providedIn: 'root' })
export class HeatmapLogicService {

  filterScans(scans: Scan[], filter: FilterState): Scan[] {
    const targetYearStr = String(filter.year);
    const isMonthFilterActive = filter.month !== null && filter.month !== undefined && filter.month !== -1;
    let dateMatchPrefix = targetYearStr;

    if (isMonthFilterActive && filter.month !== null && filter.month !== undefined) {
      const monthString = String(filter.month + 1).padStart(2, '0');
      dateMatchPrefix = `${targetYearStr}-${monthString}`;
    }

    return scans.filter(scan => {
      const matchesDate = !!scan.created_at?.startsWith(dateMatchPrefix);
      const matchesDisease = filter.disease === 'all' ||
        scan.disease_key?.toLowerCase() === filter.disease.toLowerCase();

      return matchesDate && matchesDisease;
    });
  }

  getDiseaseCounts(scans: Scan[]): DiseaseCounts {
    const counts: DiseaseCounts = { healthy: 0, blackPod: 0, mealybug: 0, podBorer: 0, other: 0, total: scans.length };

    scans.forEach(scan => {
      const diseaseKey = (scan.disease_key || '').toLowerCase().replace(/[-_\s]/g, '');
      if (diseaseKey.includes('healthy')) counts.healthy++;
      else if (diseaseKey.includes('blackpod')) counts.blackPod++;
      else if (diseaseKey.includes('mealybug')) counts.mealybug++;
      else if (diseaseKey.includes('podborer')) counts.podBorer++;
      else counts.other++;
    });

    return counts;
  }

  getCoveragePercent(count: number, total: number): number {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }

  formatDisease(key: string | undefined): string {
    const text = (key || '').replace(/[_-]+/g, ' ').trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '—';
  }

  getSeverityClass(severity: string | undefined): string {
    const s = (severity || '').toLowerCase();
    if (s === 'severe') return 'bg-red-50 text-red-600 border-red-100';
    if (s === 'moderate') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    return 'bg-blue-50 text-blue-600 border-blue-100';
  }
}
