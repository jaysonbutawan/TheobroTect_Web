import { ChartConfiguration } from 'chart.js';

export const DISEASE_COLORS = {
  healthy: {
    primary: '#10b981',
  },
  blackPod: {
    primary: '#dc2626',
  },
  mealybug: {
    primary: '#3b82f6',
  },
  podBorer: {
    primary: '#eab308',
  },
} as const;

const commonLineDatasetConfig = {
  tension: 0,
  fill: false,
  pointRadius: 3,
  pointHoverRadius: 5,
  borderWidth: 2,
  pointBorderColor: '#ffffff',
  pointBorderWidth: 2,
};

export function createLineChartDataset(
  label: string,
  color: (typeof DISEASE_COLORS)[keyof typeof DISEASE_COLORS],
) {
  return {
    data: [],
    label,
    borderColor: color.primary,
    pointBackgroundColor: color.primary,
    ...commonLineDatasetConfig,
  };
}

export function getInitialLineChartData(): ChartConfiguration<'line'>['data'] {
  return {
    labels: [],
    datasets: [
      createLineChartDataset('Healthy Cacao', DISEASE_COLORS.healthy),
      createLineChartDataset('Black Pod', DISEASE_COLORS.blackPod),
      createLineChartDataset('Mealybug', DISEASE_COLORS.mealybug),
      createLineChartDataset('Pod Borer', DISEASE_COLORS.podBorer),
    ],
  };
}

export const LEGEND_ITEMS = [
  { label: 'Healthy', color: DISEASE_COLORS.healthy.primary },
  { label: 'Black Pod', color: DISEASE_COLORS.blackPod.primary },
  { label: 'Mealybug', color: DISEASE_COLORS.mealybug.primary },
  { label: 'Pod Borer', color: DISEASE_COLORS.podBorer.primary },
] as const;
