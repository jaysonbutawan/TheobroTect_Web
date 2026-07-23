import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ScanHistoryEntry {
  date: string;
  disease: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
}

export interface Scan {
  id: string | number;
  pod_id: string;
  disease: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  confidence: number;
  scanned_at: string;
  location: string;
  description?: string;
  status?: string;
  actions?: string[];
  scores?: Record<string, number>;
  history?: ScanHistoryEntry[];
}

@Component({
  selector: 'app-scan-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scan-detail-modal.component.html',
})
export class ScanDetailModalComponent {
  /** The scan record to display. Modal renders nothing when this is null. */
  @Input() scan: Scan | null = null;

  /** Emitted when the user closes the modal (backdrop click or Close button). */
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  get sortedScores(): [string, number][] {
    if (!this.scan?.scores) return [];
    return Object.entries(this.scan.scores).sort((a, b) => b[1] - a[1]);
  }

  formatDate(value: string): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatTime(value: string): string {
    if (!value) return '—';
    return new Date(value).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  formatConf(value: number): string {
    if (value == null) return '0';
    return (value <= 1 ? value * 100 : value).toFixed(1);
  }

  monitoringChecklist(severity: Scan['severity']): string[] {
    switch (severity) {
      case 'Mild':
        return [
          'Check the affected pod again in 7 days.',
          'Remove and dispose of any visibly infected pods.',
          'Keep the canopy pruned to improve airflow.',
        ];
      case 'Moderate':
        return [
          'Check nearby trees for similar symptoms.',
          'Rescan the same tree in 5 days.',
          'Apply recommended fungicide/treatment as advised.',
          'Isolate or flag the tree in your field map.',
        ];
      case 'Severe':
      default:
        return [
          'Rescan in 3 days to track progression.',
          'Contact your local DA/municipal agriculturist.',
          'Remove and destroy severely infected pods immediately.',
          'Monitor surrounding trees closely for spread.',
        ];
    }
  }
}