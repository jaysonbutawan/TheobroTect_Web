import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { take, catchError } from 'rxjs/operators';

import { DiseaseDto, MonitoringPlanDto } from '../disease-guidance.dto';
import { RecommendationDto } from '../recommendation.dto';
import { MonitoringSetupService } from '../services/monitoring-setup.service';
import { RecommendationSetupService } from '../services/recommendations-setup.service';

type ModalTab = 'general' | 'monitoring' | 'recommendations';

@Component({
  selector: 'app-disease-view-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './disease-view-modal.component.html',
})
export class DiseaseViewModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() disease: DiseaseDto | null = null;

  @Output() modalClose = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<DiseaseDto>();

  activeTab: ModalTab = 'general';
  isLoading: boolean = false;

  monitoringPlans: MonitoringPlanDto[] = [];
  recommendations: RecommendationDto[] = [];

  // BUG FIX: Expose Array.isArray to the template — Angular templates cannot call
  // global functions directly, so it must be a class method.
  readonly isArray = Array.isArray;

  // BUG FIX: Type-safe cast helpers used in the template to avoid unsafe `any` access
  asArray(content: any): { en: string; tl: string }[] {
    return Array.isArray(content) ? content : [];
  }

  asObject(content: any): { en: string; tl: string } | null {
    return content && !Array.isArray(content) ? content : null;
  }

  private monitoringService = inject(MonitoringSetupService);
  private recommendationService = inject(RecommendationSetupService);
  private cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true && this.disease) {
      this.activeTab = 'general';
      this.loadData();
    }
    if (changes['isOpen']?.currentValue === false) {
      this.monitoringPlans = [];
      this.recommendations = [];
    }
  }

  loadData(): void {
    if (!this.disease) return;
    this.isLoading = true;

    forkJoin({
      monitoring: this.monitoringService.getMonitoringPlans().pipe(
        take(1),
        catchError(() => of({ data: [] as MonitoringPlanDto[] }))
      ),
      recommendations: this.recommendationService.getRecommendations(this.disease.id).pipe(
        take(1),
        catchError(() => of([] as RecommendationDto[]))
      )
    }).subscribe({
      next: ({ monitoring, recommendations }) => {
        const allPlans: any[] = (monitoring as any)?.data ?? monitoring ?? [];

        console.log('[DiseaseViewModal] All Plans from API:', allPlans);
        console.log('[DiseaseViewModal] Current Disease:', this.disease);

        this.monitoringPlans = allPlans.filter(p => {
          console.log(`[DiseaseViewModal] Comparing plan disease_key="${p.disease_key}" vs "${this.disease!.disease_key}"`);
          return p.disease_key?.toString().toLowerCase() === this.disease!.disease_key?.toString().toLowerCase();
        });

        console.log('[DiseaseViewModal] Matched monitoring plans:', this.monitoringPlans);

        this.recommendations = Array.isArray(recommendations)
          ? recommendations
          : (recommendations as any)?.data ?? [];

        console.log('[DiseaseViewModal] Recommendations loaded:', this.recommendations);

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[DiseaseViewModal] loadData error:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

get groupedMonitoringPlans(): { severity: string; items: MonitoringPlanDto[] }[] {
  console.log('[groupedMonitoringPlans] monitoringPlans:', this.monitoringPlans);

  const groups: Record<string, MonitoringPlanDto[]> = {};

  for (const plan of this.monitoringPlans) {
    console.log('[groupedMonitoringPlans] Processing plan:', plan);

    const key = (plan.severity?.severity_level || 'general').toLowerCase();

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(plan);
  }

  console.log('[groupedMonitoringPlans] Groups:', groups);

  const standardOrder = ['mild', 'moderate', 'severe', 'general'];

  const availableKeys = Object.keys(groups);
  const extraKeys = availableKeys.filter(k => !standardOrder.includes(k));

  console.log('[groupedMonitoringPlans] Available Keys:', availableKeys);
  console.log('[groupedMonitoringPlans] Extra Keys:', extraKeys);

  const finalOrder = [...standardOrder, ...extraKeys];

  const result = finalOrder
    .filter(k => groups[k]?.length > 0)
    .map(k => ({ severity: k, items: groups[k] }));

  console.log('[groupedMonitoringPlans] Final Result:', result);

  return result;
}

  get groupedRecommendations(): { severity: string; items: RecommendationDto[] }[] {
    const groups: Record<string, RecommendationDto[]> = {};

    for (const rec of this.recommendations) {
      const key = (rec.severity?.severity_level || 'general').toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    }

    const standardOrder = ['mild', 'moderate', 'severe', 'general'];
    const availableKeys = Object.keys(groups);
    const extraKeys = availableKeys.filter(k => !standardOrder.includes(k));
    const finalOrder = [...standardOrder, ...extraKeys];

    return finalOrder
      .filter(k => groups[k]?.length > 0)
      .map(k => ({ severity: k, items: groups[k] }));
  }

  formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:00 ${period}`;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  close(): void {
    this.modalClose.emit();
  }

  onEdit(): void {
    if (this.disease) {
      this.editRequested.emit(this.disease);
      this.close();
    }
  }
}
