import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldReportsApiService } from './api.service'; 
import { ScanResultDto } from './scan_result.dto';
import { MapService } from '../../app/core/services/map.service';

export interface ScanRecord {
  id: string;
  timestamp: string;
  disease: string;       // e.g. "Black Pod Rot", "Pod Borer"
  technician?: string;
  techAvatar: string;
  location: string;
  status: 'Healthy' | 'Black Pod Rot' | 'Pod Borer' | 'Mealy Bug';
}
@Component({
  selector: 'app-field-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-reports-list.component.html', 
  styleUrls: ['./shared-reports.css']
})

export class FieldReportsComponent   {
 @Input() recentScans: ScanRecord[] = [
  { id: '#SCAN-8921', timestamp: 'Oct 24, 2023 • 14:22', disease: 'Healthy',  techAvatar: 'assets/techs/1.jpg', location: 'North Sector B-12', status: 'Healthy' },
    { id: '#SCAN-8920', timestamp: 'Oct 24, 2023 • 12:45', disease: 'Black Pod Rot', techAvatar: 'assets/techs/2.jpg', location: 'West Valley Block 4', status: 'Black Pod Rot' },
    { id: '#SCAN-8919', timestamp: 'Oct 23, 2023 • 09:15', disease: 'Pod Borer',  techAvatar: 'assets/techs/3.jpg', location: 'East Orchard 7', status: 'Pod Borer' },
    { id: '#SCAN-8918', timestamp: 'Oct 22, 2023 • 16:30', disease: 'Mealy Bug', techAvatar: 'assets/techs/4.jpg', location: 'South Perimeter', status: 'Mealy Bug' },
 ];

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Healthy':       'bg-emerald-100 text-emerald-700',
      'Black Pod Rot': 'bg-orange-100 text-orange-700',
      'Pod Borer':     'bg-red-100 text-red-700',
      'Mealy Bug':     'bg-purple-100 text-purple-700',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }

  getDotClass(status: string): string {
    const map: Record<string, string> = {
      'Healthy':       'bg-emerald-500',
      'Black Pod Rot': 'bg-orange-500',
      'Pod Borer':     'bg-red-500',
      'Mealy Bug':     'bg-purple-500',
    };
    return map[status] ?? 'bg-slate-400';
  }

  constructor(private mapService: MapService) {}

  // 3. This MUST be ngAfterViewInit, not ngOnInit
  ngAfterViewInit(): void {
    // Initialize the map on the div with id="map"
    this.mapService.initMap('map');

    // 4. Use the Service methods to add markers
    // No need for 'L.marker' or 'hotspotIcon' here!
    this.mapService.addHotspot(7.4478, 125.8094, 'red');    // Hotspot 1
    this.mapService.addHotspot(7.4500, 125.8100, 'orange'); // Hotspot 2
  }
  presets = ['1W', '1M', '6M', '1Y'];
  activePreset = '6M';

  // Dynamic Legend Data
  diseaseStats = [
    { name: 'Black Pod', count: 14, trendValue: 2, trendUp: true, color: 'orange' },
    { name: 'Pod Borer', count: 8, trendValue: 1, trendUp: true, color: 'red' },
    { name: 'Mealy Bug', count: 5, trendValue: 3, trendUp: false, color: 'purple' },
    { name: 'Healthy', count: 73, trendValue: 5, trendUp: false, color: 'emerald' }
  ];

  setPreset(preset: string) {
    this.activePreset = preset;
    this.fetchNewData();
  }

  toggleCustomRange() {
    // Logic to open a PrimeNG Calendar or Modal
    console.log('Opening Calendar...');
  }

  fetchNewData() {
    console.log(`Fetching ${this.activePreset} statistics from Laravel...`);
    // Example: this.api.getStats(this.activePreset).subscribe(...)
  }

  selectedYear = 2025;
availableYears = [2025, 2024, 2023, 2022];

months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Per-year summary percentages shown in the legend badges
yearData: Record<number, { blackPod: number; podBorer: number; mealyBug: number; healthy: number }> = {
  2025: { blackPod: 38, podBorer: 27, mealyBug: 19, healthy: 74 },
  2024: { blackPod: 42, podBorer: 31, mealyBug: 22, healthy: 68 },
  2023: { blackPod: 29, podBorer: 18, mealyBug: 14, healthy: 81 },
  2022: { blackPod: 51, podBorer: 35, mealyBug: 28, healthy: 59 },
};

chartSummary = this.yearData[this.selectedYear];

onYearChange(): void {
  this.chartSummary = this.yearData[this.selectedYear];
}
}