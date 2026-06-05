import {
  Component, Input, inject, SimpleChanges,
  OnChanges, ChangeDetectorRef, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { ChecklistItem } from '../diease-guidance.component';
import { DiseaseSeverityService } from '../services/disease-severity.service';
import { CreateDiseaseSeverityDto, MonitoringPlanDto } from '../disease-guidance.dto';
import { MonitoringSetupService } from '../services/monitoring-setup.service';
import { ToastService } from '../../../app/shared/components/toast/toast.service';

@Component({
  selector: 'app-monitoring-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './monitoring-setup.component.html',
})
export class MonitoringSetupComponent implements OnChanges, OnInit {
  @Input({ required: true }) form!: FormGroup;
  @Input() checklistItems: ChecklistItem[] = [];
  @Input() diseaseId: number | null = null;
  @Input() diseaseKey: string | null = null;

  activeSev: 'mild' | 'moderate' | 'severe' = 'mild';
  existingSeverities: any[] = [];

  translating: Record<string, boolean> = {};
  private severityService = inject(DiseaseSeverityService);
  private monitoringService = inject(MonitoringSetupService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  currentMonitoringPlan: MonitoringPlanDto | null = null;

  get showSeverity(): boolean {
    if (!this.diseaseKey) return true;
    const key = this.diseaseKey.toLowerCase().trim();
    return key !== 'healthy' && key !== 'non_cacao';
  }

  ngOnInit(): void {
    if (this.form) {
      if (!this.form.contains('rescanDays')) {
        this.form.addControl('rescanDays', new FormControl(''));
      }
      if (!this.form.contains('preferredTime')) {
        this.form.addControl('preferredTime', new FormControl(''));
      }
      if (!this.form.contains('guidanceEn')) {
        this.form.addControl('guidanceEn', new FormControl(''));
      }
      if (!this.form.contains('guidanceTl')) {
        this.form.addControl('guidanceTl', new FormControl(''));
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diseaseId'] && this.diseaseId) {
      this.fetchSeverities();
    }
  }

  fetchSeverities(): void {
    this.severityService.getSeverities().subscribe({
      next: (res: any) => {
        this.existingSeverities = res?.data ?? res ?? [];
        const diseaseSeverities = this.existingSeverities.filter(
          (sev: any) => Number(sev.disease_id) === Number(this.diseaseId)
        );

        if (this.showSeverity) {
          this.autoCreateMissingSeverities(diseaseSeverities);
        } else {
          this.loadMonitoringPlan();
        }

        this.cdr.markForCheck();
      },
      error: () => {
         this.toastService.show('error', 'Load Failed', 'Failed to load data.');
      }
    });
  }

  loadMonitoringPlan(): void {
    if (!this.diseaseKey) {
      return;
    }

    this.monitoringService.getMonitoringPlans().subscribe({
      next: (res: any) => {
        const plans = res?.data ?? res ?? [];

        if (!this.showSeverity) {
          this.currentMonitoringPlan = plans.find(
            (plan: any) => plan.disease_key === this.diseaseKey
          ) || null;
        } else {
          const matchingSeverity = this.existingSeverities.find(
            (sev: any) =>
              Number(sev.disease_id) === Number(this.diseaseId) &&
              sev.severity_level?.toLowerCase() === this.activeSev.toLowerCase()
          );

          if (matchingSeverity) {
            this.currentMonitoringPlan = plans.find(
              (plan: any) => Number(plan.disease_severity_id) === Number(matchingSeverity.id)
            ) || null;
          } else {
            this.currentMonitoringPlan = null;
          }
        }

        if (this.currentMonitoringPlan) {
          const hour = this.currentMonitoringPlan.preferred_time_hour;
          const formattedTime = (hour !== null && hour !== undefined)
            ? `${hour.toString().padStart(2, '0')}:00`
            : '';

          this.form.patchValue({
            rescanDays: this.currentMonitoringPlan.rescan_after_days,
            preferredTime: formattedTime,
            guidanceEn: this.currentMonitoringPlan.message?.en ?? '',
            guidanceTl: this.currentMonitoringPlan.message?.tl ?? ''
          });
        } else {
          this.form.patchValue({ rescanDays: '', preferredTime: '', guidanceEn: '', guidanceTl: '' });
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.toastService.show('error', 'Load Failed', 'Failed to load monitoring plans.');
      }
    });
  }

  saveMonitoringPlan(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.show('warning', 'Validation Error', 'Please check the form for errors before saving.');
      return;
    }

    if (!this.diseaseKey) {
      this.toastService.show('error', 'Missing Data', 'Disease identification key is missing.');
      return;
    }

    const formValue = this.form.value;
    let severityId: number | null = null;

    if (this.showSeverity) {
      const matchingSeverity = this.existingSeverities.find(
        (sev: any) =>
          Number(sev.disease_id) === Number(this.diseaseId) &&
          sev.severity_level?.toLowerCase() === this.activeSev.toLowerCase()
      );

      if (!matchingSeverity) {
        this.toastService.show('error', 'Severity Not Found', 'Target severity data does not exist for this disease.');
        return;
      }
      severityId = matchingSeverity.id;
    }

    let hourInteger: number | null = null;
    if (formValue.preferredTime) {
      const parts = formValue.preferredTime.split(':');
      hourInteger = parseInt(parts[0], 10);
    }

    const payload: any = {
      disease_key: this.showSeverity ? null : this.diseaseKey,
      disease_severity_id: this.showSeverity ? severityId : null,
      rescan_after_days: (() => {
        const rawValue = formValue.rescanDays !== undefined
          ? formValue.rescanDays
          : formValue.rescan_after_days;

        const parsed = parseInt(rawValue, 10);
        return isNaN(parsed) ? 0 : parsed;
      })(),

      preferred_time_hour: hourInteger,

      message: {
        en: (formValue.guidanceEn !== undefined ? formValue.guidanceEn : formValue.guidance_en) || '',
        tl: (formValue.guidanceTl !== undefined ? formValue.guidanceTl : formValue.guidance_tl) || ''
      },
    };

    if (this.currentMonitoringPlan?.id) {
      this.monitoringService.updateMonitoringPlan(this.currentMonitoringPlan.id, payload).subscribe({
        next: () => {
          this.toastService.show('success', 'Updated Successfully', 'The monitoring plan has been updated.');
          this.loadMonitoringPlan();
        },
        error: () => {
          this.toastService.show('error', 'Update Failed', 'An error occurred while updating the monitoring plan.');
        }
      });
    } else {
      this.monitoringService.createMonitoringPlan(payload).subscribe({
        next: () => {
          this.toastService.show('success', 'Created Successfully', 'A new monitoring plan has been created.');
          this.loadMonitoringPlan();
        },
        error: () => {
          this.toastService.show('error', 'Creation Failed', 'An error occurred while creating the monitoring plan.');
        }
      });
    }
  }

  deleteMonitoringPlan(): void {
    if (!this.currentMonitoringPlan?.id) {
      this.toastService.show('error', 'Delete Failed', 'Failed to delete monitoring plan.');
      return;
    }

    const planIdToDelete = this.currentMonitoringPlan.id;
    this.monitoringService.deleteMonitoringPlan(planIdToDelete).subscribe({
      next: () => {
        this.toastService.show('success', 'Deleted Successfully', 'The monitoring plan has been deleted.');
        this.currentMonitoringPlan = null;
        this.form.patchValue({ rescanDays: '', preferredTime: '', guidanceEn: '', guidanceTl: '' });
        this.cdr.markForCheck();
      },
      error: () => {
        this.toastService.show('error', 'Delete Failed', 'Failed to delete monitoring plan.');
      }
    });
  }

  private autoCreateMissingSeverities(diseaseSeverities: any[]): void {
    const requiredSeverities: Array<'mild' | 'moderate' | 'severe'> = ['mild', 'moderate', 'severe'];

    requiredSeverities.forEach(level => {
      const exists = diseaseSeverities.some(
        (sev: any) => sev.severity_level?.toLowerCase() === level.toLowerCase()
      );

      if (!exists) {
        console.log(`[MonitoringSetup] Creating missing severity configuration layout step context entry matching: "${level}"`);
        const diseaseId = this.diseaseId;
        if (!diseaseId) return;

        const payload: CreateDiseaseSeverityDto = {
          disease_id: diseaseId,
          severity_level: level
        };

        this.severityService.createSeverity(payload).subscribe({
          next: (res: any) => {
            console.log(`✅ [MonitoringSetup] "${level}" severity record created dynamically:`, res);
            this.existingSeverities.push(res?.data ?? res);
            this.loadMonitoringPlan();
            this.cdr.markForCheck();
          },
          error: () => {}
        });
      } else {
        this.loadMonitoringPlan();
      }
    });
  }

  onSeveritySelect(level: 'mild' | 'moderate' | 'severe'): void {
    if (!this.showSeverity) {
      return;
    }

    this.activeSev = level;

    if (!this.diseaseId) {
      return;
    }

    const matchExists = this.existingSeverities.some(
      (sev: any) => Number(sev.disease_id) === Number(this.diseaseId) && sev.severity_level === level
    );

    if (!matchExists) {
      const payload = {
        disease_id: this.diseaseId,
        severity_level: level
      };

      this.severityService.createSeverity(payload).subscribe({
        next: (res: any) => {
          const newlyCreated = res?.data ?? res;
          this.existingSeverities.push(newlyCreated);
          this.loadMonitoringPlan();
          this.cdr.markForCheck();
        },
        error: () => {}
      });
    } else {
      this.loadMonitoringPlan();
    }
  }

  formatLabel(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  onEnInput(sourceControlName: string, targetControlName: string): void {
    /* your implementation */
  }
}
