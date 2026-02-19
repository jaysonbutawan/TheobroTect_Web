import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CacaoScan {
  id: string;
  date: string;
  farmSection: string;
  severity: 'High' | 'Medium' | 'Low' | 'Stable';
  imageCount: number;
}

@Component({
  selector: 'app-black-pod-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './black-pod-reports.component.html',
  styleUrl: '../shared-reports.css' // We will create this shared file
})
export class BlackPodReportsComponent {
scans = signal([
  { id: 'BP-2026-001', date: '2026-02-19', farmSection: 'North Quad', severity: 'High', imageCount: 12 },
  { id: 'BP-2026-002', date: '2026-02-19', farmSection: 'East Ridge', severity: 'Medium', imageCount: 8 },
  { id: 'BP-2026-003', date: '2026-02-18', farmSection: 'South Basin',severity: 'Low', imageCount: 4 },
  { id: 'BP-2026-004', date: '2026-02-18', farmSection: 'West Sector',severity: 'High', imageCount: 15 },
  { id: 'BP-2026-005', date: '2026-02-17', farmSection: 'Central Hub', severity: 'Medium', imageCount: 6 },
  { id: 'BP-2026-006', date: '2026-02-17', farmSection: 'North Quad',  severity: 'Low', imageCount: 3 },
  { id: 'BP-2026-007', date: '2026-02-16', farmSection: 'East Ridge',  severity: 'High', imageCount: 22 },
  { id: 'BP-2026-008', date: '2026-02-16', farmSection: 'Riverside', severity: 'Medium', imageCount: 9 },
  { id: 'BP-2026-009', date: '2026-02-15', farmSection: 'South Basin', severity: 'Low', imageCount: 5 },
  { id: 'BP-2026-010', date: '2026-02-15', farmSection: 'West Sector', severity: 'High', imageCount: 18 }
]);
}