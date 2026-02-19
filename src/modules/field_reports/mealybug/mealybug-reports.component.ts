import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mealybug-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mealybug-reports.component.html',
  styleUrl: '../shared-reports.css'
})
export class MealybugReportsComponent {
  scans = signal([
  { id: 'MB-2026-001', date: '2026-02-19', farmSection: 'North Quad',  severity: 'High', imageCount: 14 },
  { id: 'MB-2026-002', date: '2026-02-19', farmSection: 'East Ridge',  severity: 'Medium', imageCount: 7 },
  { id: 'MB-2026-003', date: '2026-02-18', farmSection: 'South Basin',  severity: 'Low', imageCount: 5 },
  { id: 'MB-2026-004', date: '2026-02-18', farmSection: 'West Sector',  severity: 'High', imageCount: 20 },
  { id: 'MB-2026-005', date: '2026-02-17', farmSection: 'Central Hub',  severity: 'Medium', imageCount: 9 },
  { id: 'MB-2026-006', date: '2026-02-17', farmSection: 'North Quad',  severity: 'Low', imageCount: 2 },
  { id: 'MB-2026-007', date: '2026-02-16', farmSection: 'East Ridge',  severity: 'High', imageCount: 11 },
  { id: 'MB-2026-008', date: '2026-02-16', farmSection: 'Riverside',  severity: 'Medium', imageCount: 6 },
  { id: 'MB-2026-009', date: '2026-02-15', farmSection: 'South Basin', severity: 'Low', imageCount: 4 },
  { id: 'MB-2026-010', date: '2026-02-15', farmSection: 'West Sector', severity: 'High', imageCount: 13 }
]);
}