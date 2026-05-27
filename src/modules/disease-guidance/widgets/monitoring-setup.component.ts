import {
  Component, Input, inject, SimpleChanges,
  OnChanges, ChangeDetectorRef, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { ChecklistItem } from '../diease-guidance.component';
import { DiseaseSeverityService } from '../services/disease-severity.service';
import { CreateDiseaseSeverityDto, CreateMonitoringPlanDto, MonitoringPlanDto } from '../disease-guidance.dto';
import { MonitoringSetupService } from '../services/monitoring-setup.service';

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
    console.log('[MonitoringSetup] ngOnChanges triggered:', changes);

    if (changes['diseaseId'] && this.diseaseId) {
      console.log(`[MonitoringSetup] Active Disease ID changed -> ${this.diseaseId}`);
      this.fetchSeverities();
    }
  }

  fetchSeverities(): void {
    console.log(`[MonitoringSetup] Fetching severities for Disease ID: ${this.diseaseId}`);

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
      error: (err) => {
        console.error('❌ [MonitoringSetup Error] Unable to trace reference list records from service endpoints:', err);
      }
    });
  }

  loadMonitoringPlan(): void {
    if (!this.diseaseKey) {
      console.warn('⚠️ [MonitoringSetup] loadMonitoringPlan aborted: missing diseaseKey.');
      return;
    }

    console.log(`[MonitoringSetup] Loading monitoring plans for key: "${this.diseaseKey}"`);
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
          console.log('✅ [MonitoringSetup] Matching setup configuration found:', this.currentMonitoringPlan);

          // Convert integer hour from backend (e.g. 14) to "14:00" string format for HTML time input
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
          console.log('[MonitoringSetup] No matching layout template rules found. Resetting state configurations.');
          this.form.patchValue({ rescanDays: '', preferredTime: '', guidanceEn: '', guidanceTl: '' });
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ [MonitoringSetup Error] Failed to read component monitoring plans collection:', err);
      }
    });
  }

  saveMonitoringPlan(): void {
    // --- DEBUG BLOCK START ---
    console.group('🔍 [MonitoringSetup Debug] Form Values vs Payload Check');
    console.log('1. Raw Angular Form Object Value:', this.form.value);
    console.log('2. Checklist Items State:', this.checklistItems);
    console.log('3. Active Component Properties:', {
      diseaseKey: this.diseaseKey,
      diseaseId: this.diseaseId,
      activeSev: this.activeSev,
      showSeverity: this.showSeverity,
      currentMonitoringPlanId: this.currentMonitoringPlan?.id
    });
    // --- DEBUG BLOCK END ---

    if (this.form.invalid) {
      console.error('❌ [MonitoringSetup Error] Upsert process rejected: Form structure fails evaluation values.', this.form.errors);
      console.groupEnd();
      this.form.markAllAsTouched();
      return;
    }
    if (!this.diseaseKey) {
      console.error('❌ [MonitoringSetup Error] Upsert process rejected: missing identification parameters for "diseaseKey".');
      console.groupEnd();
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
        console.error(`❌ [MonitoringSetup Error] Upsert stopped: target relational severity data row doesn't exist for ID ${this.diseaseId} (${this.activeSev})`);
        console.groupEnd();
        return;
      }
      severityId = matchingSeverity.id;
    }

    let hourInteger: number | null = null;
    if (formValue.preferredTime) {
      const parts = formValue.preferredTime.split(':');
      hourInteger = parseInt(parts[0], 10);
    }

    // Structural payload tailored for your Laravel architecture
    const payload: any = {

      disease_key: this.showSeverity
        ? null
        : this.diseaseKey,

      disease_severity_id: this.showSeverity
        ? severityId
        : null,

      rescan_after_days: (() => {
        const rawValue =
          formValue.rescanDays !== undefined
            ? formValue.rescanDays
            : formValue.rescan_after_days;

        const parsed = parseInt(rawValue, 10);

        return isNaN(parsed) ? 0 : parsed;
      })(),

      preferred_time_hour: hourInteger,

      message: {
        en: (
          formValue.guidanceEn !== undefined
            ? formValue.guidanceEn
            : formValue.guidance_en
        ) || '',

        tl: (
          formValue.guidanceTl !== undefined
            ? formValue.guidanceTl
            : formValue.guidance_tl
        ) || ''
      },
    };

    // --- CRITICAL INSPECTION POINT ---
    console.log('🚀 FINAL OUTBOUND PAYLOAD SENT TO BACKEND:');
    console.dir(payload);
    console.groupEnd();
    // ---------------------------------

    if (this.currentMonitoringPlan?.id) {
      console.log(`[MonitoringSetup] Record matches existing tracking context: Updating plan entry data with ID ${this.currentMonitoringPlan.id}`);
      this.monitoringService.updateMonitoringPlan(this.currentMonitoringPlan.id, payload).subscribe({
        next: () => {
          console.log(`✅ [MonitoringSetup] Plan dataset ID ${this.currentMonitoringPlan?.id} successfully modified.`);
          this.loadMonitoringPlan();
        },
        error: (err) => {
          console.error(`❌ [MonitoringSetup Error] Failed updating target row data for entry ID ${this.currentMonitoringPlan?.id}:`, err);
        }
      });
    } else {
      console.log('[MonitoringSetup] No existing context records found: Instantiating standard creation lifecycle flow.');
      this.monitoringService.createMonitoringPlan(payload).subscribe({
        next: () => {
          console.log('✅ [MonitoringSetup] New configuration dataset created completely.');
          this.loadMonitoringPlan();
        },
        error: (err) => {
          console.error('❌ [MonitoringSetup Error] Creation flow service routine failed. Server validation messages:', err.error);
          console.log('Failed payload state copy for reference evaluation:', payload);
        }
      });
    }
  }

  deleteMonitoringPlan(): void {
    if (!this.currentMonitoringPlan?.id) {
      console.warn('⚠️ [MonitoringSetup] Delete operations aborted: context parameters target layout does not provide key variables.');
      return;
    }

    const planIdToDelete = this.currentMonitoringPlan.id;
    this.monitoringService.deleteMonitoringPlan(planIdToDelete).subscribe({
      next: () => {
        console.log(`✅ [MonitoringSetup] Plan parameters matching row record ${planIdToDelete} purged.`);
        this.currentMonitoringPlan = null;
        this.form.patchValue({ rescanDays: '', preferredTime: '', guidanceEn: '', guidanceTl: '' });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(`❌ [MonitoringSetup Error] Delete service sequence failed on target item ${planIdToDelete}:`, err);
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
          error: (err) => {
            console.error(`❌ [MonitoringSetup Error] Missing dynamic asset production loop encountered issues for tier context level "${level}":`, err);
          }
        });
      } else {
        this.loadMonitoringPlan();
      }
    });
  }

  onSeveritySelect(level: 'mild' | 'moderate' | 'severe'): void {
    if (!this.showSeverity) {
      console.warn('⚠️ [MonitoringSetup] Operation blocked: Selected structure variant does not process multi-tiered severities configuration blocks.');
      return;
    }

    console.log(`[MonitoringSetup] Severity Target Changed -> ${level}`);
    this.activeSev = level;

    if (!this.diseaseId) {
      console.error('❌ [MonitoringSetup Error] Target manipulation abandoned: Identification constraints missing disease tracking info.');
      return;
    }

    const matchExists = this.existingSeverities.some(
      (sev: any) => Number(sev.disease_id) === Number(this.diseaseId) && sev.severity_level === level
    );

    if (!matchExists) {
      console.log(`[MonitoringSetup] "${level}" layout metadata not found for Context ID ${this.diseaseId}. Dispatching structural dependencies...`);
      const payload = {
        disease_id: this.diseaseId,
        severity_level: level
      };

      this.severityService.createSeverity(payload).subscribe({
        next: (res: any) => {
          const newlyCreated = res?.data ?? res;
          this.existingSeverities.push(newlyCreated);
          console.log(`✅ [MonitoringSetup] "${level}" tier context registered successfully.`, newlyCreated);
          this.loadMonitoringPlan();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error(`❌ [MonitoringSetup Error] Registration failure for configuration parameters of tier level type "${level}":`, err);
        }
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
