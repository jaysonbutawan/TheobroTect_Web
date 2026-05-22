import {
  Component, Input, inject, SimpleChanges,
  OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChecklistItem } from './diease-guidance.component';
import { DiseaseSeverityService } from './disease-severity.service';
import { CreateDiseaseSeverityDto, CreateMonitoringPlanDto, MonitoringPlanDto } from './disease-guidance.dto';
import { MonitoringSetupService } from './monitoring-setup.service';

@Component({
  selector: 'app-monitoring-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './monitoring-setup.component.html',
})
export class MonitoringSetupComponent implements OnChanges {
  @Input({ required: true }) form!: FormGroup;
  @Input() checklistItems: ChecklistItem[] = [];
  @Input() diseaseId: number | null = null;
  @Input() diseaseKey: string | null = null;

  activeSev: 'mild' | 'moderate' | 'severe' = 'mild';
  existingSeverities: any[] = [];

  translating: Record<string, boolean> = {};
  private severityService = inject(DiseaseSeverityService);
  private monitoringService = inject(MonitoringSetupService);
  currentMonitoringPlan: MonitoringPlanDto | null = null;

  get showSeverity(): boolean {
    if (!this.diseaseKey) return true;
    const key = this.diseaseKey.toLowerCase().trim();
    return key !== 'healthy' && key !== 'non_cacao';
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('[MonitoringSetup] ngOnChanges triggered:', changes);

    if (changes['diseaseId'] && this.diseaseId) {
      console.log(`[MonitoringSetup] Active Disease ID changed -> ${this.diseaseId}`);
      this.fetchSeverities();
    }
  }

  loadMonitoringPlan(): void {
    if (!this.diseaseKey) return;

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
          this.form.patchValue({
            rescanDays: this.currentMonitoringPlan.rescan_after_days,
            preferredTime: this.currentMonitoringPlan.preferred_time_hour,
            guidanceEn: this.currentMonitoringPlan.message?.en ?? '',
            guidanceTl: this.currentMonitoringPlan.message?.tl ?? ''
          });
        } else {
          this.form.patchValue({ rescanDays: '', preferredTime: '', guidanceEn: '', guidanceTl: '' });
        }
      },
      error: (err) => console.error('[MonitoringSetup] Error reading plans:', err)
    });
  }

saveMonitoringPlan(): void {
  if (this.form.invalid || !this.diseaseKey) return;

  const formValue = this.form.value;
  let severityId: number | null = null;

  if (this.showSeverity) {
    const matchingSeverity = this.existingSeverities.find(
      (sev: any) =>
        Number(sev.disease_id) === Number(this.diseaseId) &&
        sev.severity_level?.toLowerCase() === this.activeSev.toLowerCase()
    );
    if (!matchingSeverity) return;
    severityId = matchingSeverity.id;
  }
  const formattedChecklist = (this.checklistItems || []).map(item => ({
    id: (item as any).id?.toString(),
    task: (item as any).task || (item as any).name || (item as any).title || '',
    checked: (item as any).checked || (item as any).completed || false
  }));

  const payload: CreateMonitoringPlanDto = {
    disease_key: this.diseaseKey,
    disease_severity_id: severityId,
    rescan_after_days: Number(formValue.rescanDays),
    preferred_time_hour: formValue.preferredTime,
    message: {
      en: formValue.guidanceEn,
      tl: formValue.guidanceTl
    },
    checklist: formattedChecklist
  };

  if (this.currentMonitoringPlan?.id) {
    this.monitoringService.updateMonitoringPlan(this.currentMonitoringPlan.id, payload).subscribe({
      next: () => {
        console.log('[MonitoringSetup] Plan updated successfully.');
        this.loadMonitoringPlan();
      }
    });
  } else {
    this.monitoringService.createMonitoringPlan(payload).subscribe({
      next: () => {
        console.log('[MonitoringSetup] Plan created successfully.');
        this.loadMonitoringPlan();
      }
    });
  }
}

  deleteMonitoringPlan(): void {
    if (!this.currentMonitoringPlan?.id) return;

    this.monitoringService.deleteMonitoringPlan(this.currentMonitoringPlan.id).subscribe({
      next: () => {
        console.log('[MonitoringSetup] Plan removed successfully.');
        this.currentMonitoringPlan = null;
        this.form.patchValue({ rescanDays: '', preferredTime: '', guidanceEn: '', guidanceTl: '' });
      },
      error: (err) => console.error('[MonitoringSetup] Delete failed:', err)
    });
  }

  fetchSeverities(): void {
    console.log(`[MonitoringSetup] Fetching severities for Disease ID: ${this.diseaseId}`);

    this.severityService.getSeverities().subscribe({
      next: (res: any) => {
        this.existingSeverities = res?.data ?? res ?? [];
        console.log('[MonitoringSetup] All Severities:', this.existingSeverities);
        const diseaseSeverities = this.existingSeverities.filter(
          (sev: any) => Number(sev.disease_id) === Number(this.diseaseId)
        );

        console.log(`[MonitoringSetup] Existing for Disease ${this.diseaseId}:`, diseaseSeverities);
        if (this.showSeverity) {
          this.autoCreateMissingSeverities(diseaseSeverities);
        } else {
          console.log('[MonitoringSetup] Skipping background auto-creation: Severity layout is disabled for healthy/non_cacao profiles.');
        }
      },
      error: (err) => {
        console.error('[MonitoringSetup] Failed to fetch severities:', err);
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
        console.log(`[MonitoringSetup] Missing "${level}" → Creating for disease ${this.diseaseId}`);
        const diseaseId = this.diseaseId;
        if (!diseaseId) return;

        const payload: CreateDiseaseSeverityDto = {
          disease_id: diseaseId,
          severity_level: level
        };

        this.severityService.createSeverity(payload).subscribe({
          next: (res: any) => {
            console.log(`[MonitoringSetup] Auto-created "${level}" severity`, res);
            this.existingSeverities.push(res?.data ?? res);
          },
          error: (err) => {
            console.error(`[MonitoringSetup] Failed auto-creating "${level}"`, err);
          }
        });
      } else {
        console.log(`[MonitoringSetup] "${level}" already exists for this disease`);
      }
    });
  }

  onSeveritySelect(level: 'mild' | 'moderate' | 'severe'): void {
    //CRITICAL GUARD: Instantly exit if selected plant layout doesn't use severities
    if (!this.showSeverity) {
      console.warn('[MonitoringSetup] Selection rejected. Severities do not apply to healthy/non_cacao records.');
      return;
    }

    console.log(`[MonitoringSetup] Severity Selected -> ${level}`);
    this.activeSev = level;

    if (!this.diseaseId) {
      console.warn('[MonitoringSetup] Cannot create severity. No disease selected.');
      return;
    }

    console.log(`[MonitoringSetup] Checking if "${level}" already exists for Disease ID ${this.diseaseId}`);

    const matchExists = this.existingSeverities.some(
      (sev: any) => sev.disease_id === this.diseaseId && sev.severity_level === level
    );

    console.log(`[MonitoringSetup] Severity Exists? -> ${matchExists}`);

    if (!matchExists) {
      console.log(`[MonitoringSetup] "${level}" severity NOT FOUND. Creating now...`);
      const payload = {
        disease_id: this.diseaseId,
        severity_level: level
      };

      console.log('[MonitoringSetup] Create Severity Payload:', payload);

      this.severityService.createSeverity(payload).subscribe({
        next: (res: any) => {
          console.log('[MonitoringSetup] Create Severity API Response:', res);
          const newlyCreated = res?.data ?? res;
          this.existingSeverities.push(newlyCreated);
          console.log(`[MonitoringSetup] "${level}" severity successfully created.`, newlyCreated);
        },
        error: (err) => {
          console.error(`[MonitoringSetup] Failed creating "${level}" severity.`, err);
        }
      });
    } else {
      console.log(`[MonitoringSetup] "${level}" severity already exists. No creation needed.`);
    }
  }

  formatLabel(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  onEnInput(sourceControlName: string, targetControlName: string): void {
    /* your implementation */
  }
}
