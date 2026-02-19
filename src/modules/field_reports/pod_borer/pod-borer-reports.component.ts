import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pod-borer-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pod-borer-reports.component.html',
  styleUrl: '../shared-reports.css'
})
export class PodBorerReportsComponent {
  scans = signal([
  { id: 'PB-2026-001', date: '2026-02-19', farmSection: 'Valley Floor',  severity: 'High', imageCount: 16 },
  { id: 'PB-2026-002', date: '2026-02-19', farmSection: 'Upper Slope',  severity: 'Medium', imageCount: 9 },
  { id: 'PB-2026-003', date: '2026-02-18', farmSection: 'West Sector',  severity: 'High', imageCount: 21 },
  { id: 'PB-2026-004', date: '2026-02-18', farmSection: 'North Quad',  severity: 'Low', imageCount: 3 },
  { id: 'PB-2026-005', date: '2026-02-17', farmSection: 'East Ridge', severity: 'Medium', imageCount: 10 },
  { id: 'PB-2026-006', date: '2026-02-17', farmSection: 'South Basin',  severity: 'High', imageCount: 14 },
  { id: 'PB-2026-007', date: '2026-02-16', farmSection: 'Central Hub', severity: 'Medium', imageCount: 5 },
  { id: 'PB-2026-008', date: '2026-02-16', farmSection: 'Valley Floor', severity: 'Low', imageCount: 2 },
  { id: 'PB-2026-009', date: '2026-02-15', farmSection: 'Upper Slope', severity: 'High', imageCount: 19 },
  { id: 'PB-2026-010', date: '2026-02-15', farmSection: 'West Sector',  severity: 'Medium', imageCount: 7 }
]);
}