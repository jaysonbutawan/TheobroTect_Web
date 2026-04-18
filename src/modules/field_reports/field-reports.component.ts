import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapService } from '../../app/core/services/map.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ScanRecord {
  id: string;
  timestamp: string; // Format: 'Oct 24, 2023 • 14:22'
  disease: string;
  techAvatar: string;
  location: string;
  status: 'Severe' | 'Moderate' | 'Mild' | 'Healthy';
}

@Component({
  selector: 'app-field-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-reports-list.component.html',
  styleUrls: ['./shared-reports.css']
})
export class FieldReportsComponent implements AfterViewInit {
  @Input() recentScans: ScanRecord[] = [
    { id: '#SCAN-8921', timestamp: 'Oct 24, 2023 • 14:22', disease: 'Healthy', techAvatar: 'assets/1.jpg', location: 'Barangay San Jose', status: 'Healthy' },
    { id: '#SCAN-8920', timestamp: 'Oct 24, 2023 • 12:45', disease: 'Black Pod Rot', techAvatar: 'assets/2.jpg', location: 'Barangay Mabuhay', status: 'Severe' },
    { id: '#SCAN-8919', timestamp: 'Oct 23, 2023 • 09:15', disease: 'Pod Borer', techAvatar: 'assets/3.jpg', location: 'Barangay San Jose', status: 'Moderate' },
    { id: '#SCAN-8918', timestamp: 'Oct 22, 2023 • 16:30', disease: 'Mealy Bug', techAvatar: 'assets/4.jpg', location: 'Barangay Poblacion', status: 'Mild' },
  ];

  // Search and Filter States
  barangaySearchQuery: string = '';
  selectedBarangay: string | null = null;
  selectedDisease: string = 'All';
  filterDate: string = '';

  diseaseCategories = ['All', 'Black Pod Rot', 'Pod Borer', 'Mealy Bug', 'Healthy'];

  // Logic to filter the Barangay cards based on search
  get filteredBarangays(): string[] {
    const uniqueBarangays = [...new Set(this.recentScans.map(scan => scan.location))];
    return uniqueBarangays.filter(b =>
      b.toLowerCase().includes(this.barangaySearchQuery.toLowerCase())
    );
  }

  // Logic to filter the table rows (Barangay + Disease + Date)
  // Add this property

  // Update the filter logic in get filteredScans()
  get filteredScans(): ScanRecord[] {
    let scans = this.recentScans;

    if (this.selectedBarangay) {
      scans = scans.filter(s => s.location === this.selectedBarangay);
    }

    if (this.selectedDisease !== 'All') {
      scans = scans.filter(s => s.disease === this.selectedDisease);
    }

    // Exact Date Filter Logic
    if (this.filterDate) {
      scans = scans.filter(scan => {
        // Formats the scanner timestamp to YYYY-MM-DD to match the input type="date"
        const scanDate = new Date(scan.timestamp.split(' • ')[0]);
        const formattedScanDate = scanDate.toISOString().split('T')[0];
        return formattedScanDate === this.filterDate;
      });
    }

    return scans;
  }

  resetFilters() {
    this.filterDate = '';
    this.selectedDisease = 'All';
  }

  constructor(private mapService: MapService) { }

  ngAfterViewInit(): void {
    this.mapService.initMap('map');
  }

  selectBarangay(name: string) {
    this.selectedBarangay = name;
    this.selectedDisease = 'All';
    this.filterDate
  }

  setDiseaseFilter(disease: string) {
    this.selectedDisease = disease;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Severe': 'bg-red-100 text-red-700 border border-red-200',
      'Moderate': 'bg-orange-100 text-orange-700 border border-orange-200',
      'Mild': 'bg-amber-100 text-amber-700 border border-amber-200',
      'Healthy': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }

  getDotClass(status: string): string {
    const map: Record<string, string> = {
      'Severe': 'bg-red-500 animate-pulse',
      'Moderate': 'bg-orange-500',
      'Mild': 'bg-amber-500',
      'Healthy': 'bg-emerald-500',
    };
    return map[status] ?? 'bg-slate-400';
  }

generatePDF() {
  const doc = new jsPDF();
  const data = this.filteredScans;
  const timestamp = new Date().toLocaleString();
  const logoPath = 'assets/images/theobrotect_logo.png';

  // 1. HEADER & BRANDING
  doc.setFillColor(5, 150, 105); // Emerald-600
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add Logo to the top right
  // Parameters: image, type, x, y, width, height
  doc.addImage(logoPath, 'PNG', 165, 5, 30, 30);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('THEOBROTECT', 14, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AGRICULTURAL INTELLIGENCE & DISEASE SURVEILLANCE', 14, 30);
  
  // 2. REPORT METADATA
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Field Intelligence Summary', 14, 52);
  
  doc.setDrawColor(5, 150, 105); 
  doc.setLineWidth(1);
  doc.line(14, 54, 35, 54);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Barangay: ${this.selectedBarangay}`, 14, 62);
  doc.text(`Total Scans: ${data.length}`, 14, 68);
  doc.text(`Report Date: ${timestamp}`, 14, 74);

  // 3. DATA TABLE
  autoTable(doc, {
    startY: 85,
    head: [['SCAN ID', 'DIAGNOSIS', 'SEVERITY STATUS', 'TIMESTAMP']],
    body: data.map(s => [s.id, s.disease, s.status.toUpperCase(), s.timestamp]),
    theme: 'striped',
    headStyles: { 
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    didParseCell: (cellData) => {
      if (cellData.section === 'body' && cellData.column.index === 2) {
        const status = cellData.cell.raw as string;
        if (status === 'SEVERE') cellData.cell.styles.textColor = [185, 28, 28];
        if (status === 'HEALTHY') cellData.cell.styles.textColor = [5, 150, 105];
      }
    },
    styles: { fontSize: 9 },
    margin: { bottom: 60 } // Leave space at the bottom for the signature
  });

  // 4. SIGNATURE SECTION (Fixed at the bottom of the last page)
  const pageHeight = doc.internal.pageSize.getHeight();
  const sigY = pageHeight - 40; // 40mm from the bottom

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  
  // Left Side: Field Officer
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(14, sigY, 90, sigY); 
  doc.setFont('helvetica', 'bold');
  doc.text('SIGNATURE OVER PRINTED NAME', 14, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Field Intelligence Officer', 14, sigY + 10);

  // Right Side: Date Signed
  doc.line(120, sigY, 196, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE SIGNED', 120, sigY + 5);

  // 5. SYSTEM FOOTER
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text(`System Generated by TheobroTect Admin Suite`, 105, pageHeight - 10, { align: 'center' });
  }

  doc.save(`TheobroTect_Report_${this.selectedBarangay}.pdf`);
}
}