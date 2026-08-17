import { ChartConfiguration } from 'chart.js';

/**
 * Disease chart color configuration
 * Consistent colors across all dashboard charts
 */
export const DISEASE_COLORS = {
  healthy: {
    primary: '#10b981',      // Emerald-500
    rgb: 'rgba(16, 185, 129, 0.1)'
  },
  blackPod: {
    primary: '#dc2626',      // Red-600
    rgb: 'rgba(220, 38, 38, 0.1)'
  },
  mealybug: {
    primary: '#3b82f6',      // Blue-500
    rgb: 'rgba(59, 130, 246, 0.1)'
  },
  podBorer: {
    primary: '#eab308',      // Yellow-500
    rgb: 'rgba(234, 179, 8, 0.1)'
  }
} as const;

/**
 * Common dataset configuration for line charts
 */
const commonLineDatasetConfig = {
  tension: 0.4,
  fill: true,
  pointRadius: 4,
  pointHoverRadius: 6,
  borderWidth: 3,
  pointBorderColor: '#ffffff',
  pointBorderWidth: 2
};

/**
 * Create line chart dataset configuration
 */
export function createLineChartDataset(
  label: string,
  color: typeof DISEASE_COLORS[keyof typeof DISEASE_COLORS]
) {
  return {
    data: [],
    label,
    borderColor: color.primary,
    backgroundColor: color.rgb,
    pointBackgroundColor: color.primary,
    ...commonLineDatasetConfig
  };
}

/**
 * Initial line chart configuration for dashboard
 */
export function getInitialLineChartData(): ChartConfiguration<'line'>['data'] {
  return {
    labels: [],
    datasets: [
      createLineChartDataset('Healthy Cacao', DISEASE_COLORS.healthy),
      createLineChartDataset('Black Pod', DISEASE_COLORS.blackPod),
      createLineChartDataset('Mealybug', DISEASE_COLORS.mealybug),
      createLineChartDataset('Pod Borer', DISEASE_COLORS.podBorer)
    ]
  };
}

/**
 * Legend items configuration for display
 */
export const LEGEND_ITEMS = [
  { label: 'Healthy', color: DISEASE_COLORS.healthy.primary },
  { label: 'Black Pod', color: DISEASE_COLORS.blackPod.primary },
  { label: 'Mealybug', color: DISEASE_COLORS.mealybug.primary },
  { label: 'Pod Borer', color: DISEASE_COLORS.podBorer.primary }
] as const;
