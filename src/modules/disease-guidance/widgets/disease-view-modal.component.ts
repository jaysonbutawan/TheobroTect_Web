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
  template: `
@if (isOpen && disease) {
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    (click)="onBackdropClick($event)"
  >
    <!-- Blur overlay -->
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

    <!-- Modal -->
    <div
      class="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.18)] overflow-hidden"
      (click)="$event.stopPropagation()"
    >

      <!-- Modal Header -->
      <div class="flex items-start justify-between px-7 pt-7 pb-5 border-b border-slate-100">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-800 leading-tight">
              {{ disease.display_name.en || 'Disease Details' }}
            </h2>
            <p class="text-sm text-slate-400 mt-0.5 font-medium">
              {{ disease.display_name.tl || '—' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 px-7 pt-4 pb-0 border-b border-slate-100 flex-shrink-0">
        <button
          type="button"
          (click)="activeTab = 'general'"
          class="px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all duration-200 border-b-2 -mb-px"
          [ngClass]="activeTab === 'general'
            ? 'text-green-600 border-green-500 bg-green-50/50'
            : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'"
        >
          <span class="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            General Info
          </span>
        </button>
        <button
          type="button"
          (click)="activeTab = 'monitoring'"
          class="px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all duration-200 border-b-2 -mb-px"
          [ngClass]="activeTab === 'monitoring'
            ? 'text-green-600 border-green-500 bg-green-50/50'
            : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'"
        >
          <span class="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Monitoring
          </span>
        </button>
        <button
          type="button"
          (click)="activeTab = 'recommendations'"
          class="px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all duration-200 border-b-2 -mb-px"
          [ngClass]="activeTab === 'recommendations'
            ? 'text-green-600 border-green-500 bg-green-50/50'
            : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'"
        >
          <span class="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Recommendations
          </span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-y-auto px-7 py-6">

        <!-- Loading -->
        @if (isLoading) {
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <div class="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-slate-400 font-medium">Loading details...</p>
          </div>
        }

        @if (!isLoading) {

          <!-- ── GENERAL INFO TAB ── -->
          @if (activeTab === 'general') {
            <div class="space-y-5">

              <!-- Key badge + locale + ID row -->
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200">
                  {{ disease.disease_key }}
                </span>
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  [ngClass]="{
                    'bg-blue-50 text-blue-700 border border-blue-100': disease.locale === 'en',
                    'bg-amber-50 text-amber-700 border border-amber-100': disease.locale === 'tl',
                    'bg-slate-50 text-slate-600 border border-slate-100': !disease.locale
                  }">
                  {{ (disease.locale || 'en') | uppercase }}
                </span>
                <span class="text-xs font-mono text-slate-400">#{{ disease.id }}</span>
                @if (disease.created_at) {
                  <span class="ml-auto text-xs text-slate-400">
                    Added {{ disease.created_at | date:'MMM dd, yyyy' }}
                  </span>
                }
              </div>

              <!-- English Name -->
              <div class="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 space-y-4">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">EN</span>
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Disease Name</span>
                </div>
                <p class="text-base font-semibold text-slate-800">
                  {{ disease.display_name.en || '—' }}
                </p>
              </div>

              <!-- Filipino Name -->
              <div class="rounded-2xl border border-amber-100 bg-amber-50/30 p-5">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">TL</span>
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Pangalan sa Filipino</span>
                </div>
                <p class="text-base font-semibold text-slate-800 mt-2">
                  {{ disease.display_name.tl || '—' }}
                </p>
              </div>

              <!-- Description EN -->
              <div class="rounded-2xl border border-slate-100 bg-slate-50/40 p-5">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">EN</span>
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</span>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed">
                  {{ disease.description.en || 'No description available.' }}
                </p>
              </div>

              <!-- Description TL -->
              <div class="rounded-2xl border border-amber-100 bg-amber-50/30 p-5">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">TL</span>
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Paglalarawan sa Filipino</span>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed">
                  {{ disease.description.tl || 'Walang paglalarawan.' }}
                </p>
              </div>

            </div>
          }

          <!-- ── MONITORING TAB ── -->
          @if (activeTab === 'monitoring') {
            <div class="space-y-4">
              @if (monitoringPlans.length === 0) {
                <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                  <svg class="w-10 h-10 mx-auto text-slate-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
                  </svg>
                  <p class="text-sm font-medium text-slate-500">No monitoring plans configured</p>
                  <p class="text-xs text-slate-400 mt-1">Go to Edit to set up monitoring for this disease.</p>
                </div>
              }

              @for (plan of monitoringPlans; track plan.id) {
                <div class="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                  <!-- Plan header -->
                  <div class="flex items-center justify-between px-5 py-3.5 bg-slate-50/60 border-b border-slate-100">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
                      </svg>
                      <span class="text-xs font-bold text-slate-600 uppercase tracking-wide">Monitoring Plan #{{ plan.id }}</span>
                    </div>
                    @if (plan.severity?.severity_level) {
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-100': plan.severity!.severity_level === 'mild',
                          'bg-amber-50 text-amber-700 border border-amber-100': plan.severity!.severity_level === 'moderate',
                          'bg-red-50 text-red-700 border border-red-100': plan.severity!.severity_level === 'severe'
                        }">
                        {{ plan.severity!.severity_level | titlecase }}
                      </span>
                    }
                  </div>

                  <div class="p-5 grid grid-cols-2 gap-4">
                    <!-- Rescan interval -->
                    <div class="flex flex-col gap-1">
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rescan After</span>
                      <span class="text-sm font-semibold text-slate-700">
                        {{ plan.rescan_after_days }} day{{ plan.rescan_after_days !== 1 ? 's' : '' }}
                      </span>
                    </div>

                    <!-- Preferred time -->
                    <div class="flex flex-col gap-1">
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Time</span>
                      <span class="text-sm font-semibold text-slate-700">
                        @if (plan.preferred_time_hour !== null && plan.preferred_time_hour !== undefined) {
                          {{ formatHour(plan.preferred_time_hour) }}
                        } @else {
                          —
                        }
                      </span>
                    </div>

                    <!-- Guidance EN -->
                    <div class="col-span-2 flex flex-col gap-1.5">
                      <div class="flex items-center gap-1.5">
                        <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">EN</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guidance Message</span>
                      </div>
                      <p class="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                        {{ plan.message.en || '—' }}
                      </p>
                    </div>

                    <!-- Guidance TL -->
                    <div class="col-span-2 flex flex-col gap-1.5">
                      <div class="flex items-center gap-1.5">
                        <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">TL</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mensahe sa Filipino</span>
                      </div>
                      <p class="text-sm text-slate-600 leading-relaxed bg-amber-50/40 rounded-xl px-3 py-2.5 border border-amber-100">
                        {{ plan.message.tl || '—' }}
                      </p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- ── RECOMMENDATIONS TAB ── -->
          @if (activeTab === 'recommendations') {
            <div class="space-y-4">

              @if (recommendations.length === 0) {
                <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                  <svg class="w-10 h-10 mx-auto text-slate-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <p class="text-sm font-medium text-slate-500">No recommendations configured</p>
                  <p class="text-xs text-slate-400 mt-1">Go to Edit to add recommendations for this disease.</p>
                </div>
              }

              <!-- BUG FIX: Group loop was intact but rec loop was entirely missing inside it -->
              @for (group of groupedRecommendations; track group.severity) {
                <div class="rounded-2xl border overflow-hidden"
                  [ngClass]="{
                    'border-emerald-100': group.severity === 'mild',
                    'border-amber-100':   group.severity === 'moderate',
                    'border-red-100':     group.severity === 'severe',
                    'border-slate-100':   group.severity === 'general'
                  }">

                  <!-- Severity header -->
                  <div class="flex items-center gap-2 px-5 py-3 border-b"
                    [ngClass]="{
                      'bg-emerald-50/60 border-emerald-100': group.severity === 'mild',
                      'bg-amber-50/60 border-amber-100':     group.severity === 'moderate',
                      'bg-red-50/60 border-red-100':         group.severity === 'severe',
                      'bg-slate-50/60 border-slate-100':     group.severity === 'general'
                    }">
                    <div class="w-2 h-2 rounded-full"
                      [ngClass]="{
                        'bg-emerald-500': group.severity === 'mild',
                        'bg-amber-500':   group.severity === 'moderate',
                        'bg-red-500':     group.severity === 'severe',
                        'bg-slate-400':   group.severity === 'general'
                      }">
                    </div>
                    <span class="text-xs font-bold uppercase tracking-wide"
                      [ngClass]="{
                        'text-emerald-700': group.severity === 'mild',
                        'text-amber-700':   group.severity === 'moderate',
                        'text-red-700':     group.severity === 'severe',
                        'text-slate-600':   group.severity === 'general'
                      }">
                      {{ group.severity | titlecase }}
                    </span>
                    <span class="ml-auto text-[11px] font-medium text-slate-400">
                      {{ group.items.length }} item{{ group.items.length !== 1 ? 's' : '' }}
                    </span>
                  </div>

                  <!-- BUG FIX: This @for loop over rec was completely missing -->
                  <div class="divide-y divide-slate-50">
                    @for (rec of group.items; track rec.id) {
                      <div class="p-4 space-y-3">

                        <!-- Category label -->
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                          {{ rec.category_key | titlecase }}
                        </span>

                        <!-- BUG FIX: Array.isArray was used in the template but never exposed on the class -->
                        @if (isArray(rec.content)) {

                          <!-- ARRAY CONTENT (action_items / prevention_items) -->
                          <div class="space-y-3">
                            @for (item of asArray(rec.content); track $index) {
                              <div class="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                                @if (item.en) {
                                  <div class="mb-2">
                                    <div class="flex items-center gap-1.5 mb-1">
                                      <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">EN</span>
                                    </div>
                                    <p class="text-sm text-slate-600 leading-relaxed">{{ item.en }}</p>
                                  </div>
                                }
                                @if (item.tl) {
                                  <div>
                                    <div class="flex items-center gap-1.5 mb-1">
                                      <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">TL</span>
                                    </div>
                                    <p class="text-sm text-slate-600 leading-relaxed">{{ item.tl }}</p>
                                  </div>
                                }
                              </div>
                            }
                          </div>

                        } @else {

                          <!-- OBJECT CONTENT (escalate_text / seek_help_text) -->
                          @if (asObject(rec.content)?.en) {
                            <div class="mb-2">
                              <div class="flex items-center gap-1.5 mb-1">
                                <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">EN</span>
                              </div>
                              <p class="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                {{ asObject(rec.content)!.en }}
                              </p>
                            </div>
                          }
                          @if (asObject(rec.content)?.tl) {
                            <div>
                              <div class="flex items-center gap-1.5 mb-1">
                                <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">TL</span>
                              </div>
                              <p class="text-sm text-slate-600 leading-relaxed bg-amber-50/40 rounded-lg px-3 py-2 border border-amber-100">
                                {{ asObject(rec.content)!.tl }}
                              </p>
                            </div>
                          }

                        }
                      </div>
                    }
                  </div>

                </div>
              }

            </div>
          }

        }
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50/40 flex-shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-green-400"></div>
          <span class="text-xs text-slate-400 font-medium">Read-only view</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="close()"
            class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>

    </div>
  </div>
}
  `
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

  get groupedRecommendations(): { severity: string; items: RecommendationDto[] }[] {
    const groups: Record<string, RecommendationDto[]> = {};

    for (const rec of this.recommendations) {
      const key = rec.severity?.severity_level ?? 'general';
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    }

    const order = ['mild', 'moderate', 'severe', 'general'];
    return order
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
