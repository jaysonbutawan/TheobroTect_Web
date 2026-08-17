import { DashboardStats } from './dashboard-helpers';
import { SummaryStatConfig } from './summary-stat-card.component';
import { DiseaseCardConfig } from './disease-card.component';

/**
 * Generate summary stat cards configuration
 */
export function generateSummaryCards(
  stats: DashboardStats,
  selectedYear: number
): SummaryStatConfig[] {
  return [
    {
      label: 'Total Scans',
      value: stats.totalScans,
      subtitle: 'Scans Recorded',
      icon: 'fact_check',
      badgeText: 'Total',
      gradient: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
      iconBg: 'bg-slate-900',
      textColor: 'text-slate-900',
      colSpan: 'col-span-2 lg:col-span-1'
    },
    {
      label: 'Healthy Pods',
      value: stats.healthy,
      subtitle: 'Healthy Pods',
      icon: 'favorite',
      gradient: 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200',
      iconBg: 'bg-emerald-600',
      textColor: 'text-emerald-800'
    },
    {
      label: 'Diseased Pods',
      value: stats.blackPod + stats.mealybug + stats.podBorer,
      subtitle: 'Diseased Pods',
      icon: 'warning',
      gradient: 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200',
      iconBg: 'bg-red-600',
      textColor: 'text-red-800'
    },
    {
      label: 'Health Rate',
      value: stats.totalScans > 0
        ? `${((stats.healthy / stats.totalScans) * 100).toFixed(1)}%`
        : '0%',
      subtitle: 'Health Rate',
      icon: 'speed',
      gradient: 'bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200',
      iconBg: 'bg-blue-600',
      textColor: 'text-blue-800'
    }
  ];
}


export function generateDiseaseCards(stats: DashboardStats): DiseaseCardConfig[] {
  const totalScans = stats.totalScans;

  return [
    {
      title: 'Black Pod Disease',
      value: stats.blackPod,
      badge: {
        text: 'Severe Risk',
        color: 'bg-red-600 shadow-red-900/40'
      },
      icon: {
        svg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`,
        color: 'bg-red-500/10 border-red-500/20 text-red-400'
      },
      backgroundImage: 'assets/images/bp.png',
      percentageOfTotal: totalScans > 0
        ? `${((stats.blackPod / totalScans) * 100).toFixed(1)}%`
        : '0%'
    },
    {
      title: 'Mealybug',
      value: stats.mealybug,
      badge: {
        text: 'Monitoring',
        color: 'bg-blue-600 shadow-blue-900/40'
      },
      icon: {
        svg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />`,
        color: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      },
      backgroundImage: 'assets/images/mb.png',
      percentageOfTotal: totalScans > 0
        ? `${((stats.mealybug / totalScans) * 100).toFixed(1)}%`
        : '0%'
    },
    {
      title: 'Cacao Pod Borer',
      value: stats.podBorer,
      badge: {
        text: 'Manageable',
        color: 'bg-yellow-600 shadow-yellow-900/40'
      },
      icon: {
        svg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />`,
        color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
      },
      backgroundImage: 'assets/images/pb.png',
      percentageOfTotal: totalScans > 0
        ? `${((stats.podBorer / totalScans) * 100).toFixed(1)}%`
        : '0%',
      colSpan: 'sm:col-span-2 lg:col-span-1'
    }
  ];
}
