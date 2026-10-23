import { DashboardStats } from './dashboard-helpers';
import { SummaryStatConfig } from './summary-stat-card.component';
import { DiseaseCardConfig } from './disease-card.component';
import { DISEASE_COLORS } from './chart-config';

export function generateSummaryCards(stats: DashboardStats): SummaryStatConfig[] {
  return [
    { label: 'Total scans', value: stats.totalScans },
    { label: 'Healthy pods', value: stats.healthy },
    { label: 'Diseased pods', value: stats.blackPod + stats.mealybug + stats.podBorer },
    {
      label: 'Health rate',
      value:
        stats.totalScans > 0 ? `${((stats.healthy / stats.totalScans) * 100).toFixed(1)}%` : '0%',
    },
  ];
}

export function generateDiseaseCards(stats: DashboardStats): DiseaseCardConfig[] {
  const share = (count: number) =>
    stats.totalScans > 0 ? `${((count / stats.totalScans) * 100).toFixed(1)}%` : '0%';

  return [
    {
      title: 'Black pod disease',
      value: stats.blackPod,
      color: DISEASE_COLORS.blackPod.primary,
      percentageOfTotal: share(stats.blackPod),
    },
    {
      title: 'Mealybug',
      value: stats.mealybug,
      color: DISEASE_COLORS.mealybug.primary,
      percentageOfTotal: share(stats.mealybug),
    },
    {
      title: 'Cacao pod borer',
      value: stats.podBorer,
      color: DISEASE_COLORS.podBorer.primary,
      percentageOfTotal: share(stats.podBorer),
    },
  ];
}
