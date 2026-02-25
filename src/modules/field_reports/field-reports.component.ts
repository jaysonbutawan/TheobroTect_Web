import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldReportsApiService } from './api.service'; 
import { ScanResultDto } from './scan_result.dto';

@Component({
  selector: 'app-field-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-reports-list.component.html', 
  styleUrls: ['./shared-reports.css']
})
export class FieldReportsComponent implements OnInit {
  allReports: ScanResultDto[] = [];
  filteredReports: ScanResultDto[] = [];

  searchQuery: string = '';
  selectedCategory: string = 'ALL'; 

  constructor(private apiService: FieldReportsApiService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.apiService.list().subscribe({
      next: (response) => {
        this.allReports = response.scans;
        this.applyFilters();
      },
      error: (err) => console.error('Error fetching reports:', err)
    });
  }

  applyFilters(): void {
    this.filteredReports = this.allReports.filter((report) => {
      // Matches category against disease_key from DTO
      const matchesCategory = 
        this.selectedCategory === 'ALL' || 
        report.disease_key?.toUpperCase() === this.selectedCategory;

      // Matches Search against ID or Location Label
      const matchesSearch = 
        report.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (report.location_label?.toLowerCase() || '').includes(this.searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }

  // Enhanced to return Tailwind utility classes for the UI design
  getRiskClass(severity: string): string {
    if (!severity) return 'bg-slate-50 text-slate-400 border-slate-100';
    switch (severity.toUpperCase()) {
      case 'HIGH': 
        return 'bg-red-50 text-red-500 border-red-100';
      case 'MEDIUM': 
        return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'LOW': 
        return 'bg-slate-50 text-slate-900 border-slate-200';
      default: 
        return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  }
}