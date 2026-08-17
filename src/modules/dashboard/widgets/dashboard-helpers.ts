import { Scan } from '../../../app/shared/models';

export interface DashboardStats {
  blackPod: number;
  mealybug: number;
  podBorer: number;
  healthy: number;
  totalScans: number;
}

export type TrendDirection = 'up' | 'down' | 'stable';

export function createEmptyStats(): DashboardStats {
  return {
    blackPod: 0,
    mealybug: 0,
    podBorer: 0,
    healthy: 0,
    totalScans: 0
  };
}

export function normalizeDisease(diseaseKey: string | null | undefined): string {
  if (!diseaseKey) return 'healthy';
  return diseaseKey.toLowerCase().replace(/_/g, ' ').trim();
}

export function isDiseaseType(scan: Scan, diseaseType: string): boolean {
  return normalizeDisease(scan.disease_key).includes(diseaseType);
}


export function isHealthy(scan: Scan): boolean {
  return !scan.disease_key || normalizeDisease(scan.disease_key).includes('healthy');
}


export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function getTrendDirection(
  current: number,
  previous: number,
  threshold: number = 5
): TrendDirection {
  const change = calculatePercentageChange(current, previous);
  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'up' : 'down';
}

export function calculateStats(scans: Scan[]): DashboardStats {
  const stats = createEmptyStats();

  scans.forEach(scan => {
    if (isDiseaseType(scan, 'black pod')) {
      stats.blackPod++;
    } else if (isDiseaseType(scan, 'mealybug')) {
      stats.mealybug++;
    } else if (isDiseaseType(scan, 'pod borer')) {
      stats.podBorer++;
    } else if (isHealthy(scan)) {
      stats.healthy++;
    }
  });

  stats.totalScans = scans.length;
  return stats;
}


export function groupScansByDate(scans: Scan[]): { [date: string]: Scan[] } {
  const groups: { [date: string]: Scan[] } = {};

  scans.forEach(scan => {
    const dateStr = scan.scanned_at?.split(' ')[0] || new Date().toISOString().split('T')[0];
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(scan);
  });

  return groups;
}

export function groupScansByMonth(scans: Scan[]): { [month: string]: Scan[] } {
  const groups: { [month: string]: Scan[] } = {};

  scans.forEach(scan => {
    const monthStr = scan.scanned_at?.substring(0, 7) || new Date().toISOString().substring(0, 7);
    if (!groups[monthStr]) {
      groups[monthStr] = [];
    }
    groups[monthStr].push(scan);
  });

  return groups;
}

export function getMonthsOfYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, '0')}`
  );
}


export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}


export function formatMonth(monthStr: string): string {
  try {
    const date = new Date(monthStr + '-01T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short'
    });
  } catch {
    return monthStr;
  }
}


export function filterScansByYear(scans: Scan[], year: number): Scan[] {
  return scans.filter(scan => {
    if (!scan.scanned_at) return false;
    const scanYear = new Date(scan.scanned_at).getFullYear();
    return scanYear === year;
  });
}


export function getAvailableYears(scans: Scan[]): number[] {
  const yearsSet = new Set<number>();
  const currentYear = new Date().getFullYear();

  scans.forEach(scan => {
    if (scan.scanned_at) {
      yearsSet.add(new Date(scan.scanned_at).getFullYear());
    }
  });

  yearsSet.add(currentYear);

  const minYear = yearsSet.size > 0 ? Math.min(...Array.from(yearsSet)) : currentYear;
  const fullYearRange: number[] = [];

  for (let y = currentYear; y >= minYear; y--) {
    fullYearRange.push(y);
  }

  return fullYearRange;
}
