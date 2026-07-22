import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FieldReport } from '../../../shared/models';

export interface BarangayDiseaseCount {
  barangay: string;
  diseases: {
    [diseaseKey: string]: {
      mild: number;
      moderate: number;
      severe: number;
      total: number;
    };
  };
  totalCases: number;
}

export interface ReportSummary {
  reportDate: string;
  totalReports: number;
  barangayData: BarangayDiseaseCount[];
  diseaseTypes: string[];
}

export interface OfficialSignatories {
  mayorName: string;
  agricultureHeadName: string;
}

@Injectable({
  providedIn: 'root'
})
export class FieldReportPdfService {


  aggregateReportData(reports: FieldReport[]): ReportSummary {
    const barangayMap = new Map<string, BarangayDiseaseCount>();
    const diseaseTypesSet = new Set<string>();

    reports.forEach(report => {
      const barangay = report.user_address || 'Unknown';
      const disease = this.normalizeDiseaseKey(report.disease_key);
      const severity = report.severity_key?.toLowerCase() || 'mild';

      diseaseTypesSet.add(disease);

      if (!barangayMap.has(barangay)) {
        barangayMap.set(barangay, {
          barangay,
          diseases: {},
          totalCases: 0
        });
      }

      const barangayData = barangayMap.get(barangay)!;

      if (!barangayData.diseases[disease]) {
        barangayData.diseases[disease] = {
          mild: 0,
          moderate: 0,
          severe: 0,
          total: 0
        };
      }

      const diseaseData = barangayData.diseases[disease];

      if (severity === 'mild') diseaseData.mild++;
      else if (severity === 'moderate') diseaseData.moderate++;
      else if (severity === 'severe') diseaseData.severe++;

      diseaseData.total++;
      barangayData.totalCases++;
    });

    const barangayData = Array.from(barangayMap.values()).sort((a, b) =>
      a.barangay.localeCompare(b.barangay)
    );

    return {
      reportDate: new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      totalReports: reports.length,
      barangayData,
      diseaseTypes: Array.from(diseaseTypesSet).sort()
    };
  }


  generatePDF(summary: ReportSummary, signatories: OfficialSignatories): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CACAO DISEASE FIELD REPORT', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Municipal Department of Agriculture', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 6;
    doc.setFontSize(10);
    doc.text('Sawata, Davao del Norte', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Date: ${summary.reportDate}`, 14, yPosition);
    doc.text(`Total Cases: ${summary.totalReports}`, pageWidth - 14, yPosition, { align: 'right' });

    yPosition += 10;

    summary.barangayData.forEach((barangayData) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(61, 104, 58);
      doc.rect(14, yPosition - 5, pageWidth - 28, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(
        `${barangayData.barangay} (Total Cases: ${barangayData.totalCases})`,
        16,
        yPosition
      );
      doc.setTextColor(0, 0, 0);

      yPosition += 10;

      const tableData: any[] = [];

      Object.keys(barangayData.diseases).forEach(disease => {
        const counts = barangayData.diseases[disease];
        tableData.push([
          disease,
          counts.mild.toString(),
          counts.moderate.toString(),
          counts.severe.toString(),
          counts.total.toString()
        ]);
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Disease', 'Mild', 'Moderate', 'Severe', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [51, 65, 85],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          yPosition = data.cursor?.y || yPosition;
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 8;
    });

    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 10;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Prepared by:', 14, yPosition);
    yPosition += 8;

    const sigWidth = 70;
    const leftSigX = 20;
    const rightSigX = pageWidth - 20 - sigWidth;

    doc.setFont('helvetica', 'bold');
    doc.text(signatories.agricultureHeadName.toUpperCase(), leftSigX + sigWidth / 2, yPosition, { align: 'center' });
    yPosition += 2;
    doc.line(leftSigX, yPosition, leftSigX + sigWidth, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Head, Municipal Agriculture Office', leftSigX + sigWidth / 2, yPosition, { align: 'center' });

    yPosition -= 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(signatories.mayorName.toUpperCase(), rightSigX + sigWidth / 2, yPosition, { align: 'center' });
    yPosition += 2;
    doc.line(rightSigX, yPosition, rightSigX + sigWidth, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Municipal Mayor', rightSigX + sigWidth / 2, yPosition, { align: 'center' });

    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      'This is an official report generated by TheobroTect System',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    doc.text(
      `Generated on ${new Date().toLocaleString('en-PH')}`,
      pageWidth / 2,
      footerY + 4,
      { align: 'center' }
    );

    // Save PDF
    const fileName = `Field_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  private normalizeDiseaseKey(diseaseKey: string): string {
    if (!diseaseKey) return 'Unknown';

    const normalizedKey = diseaseKey.toLowerCase()
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .trim();

    if (normalizedKey.includes('cacao pod borer') ||
        normalizedKey.includes('pod borer') ||
        normalizedKey.includes('cpb')) {
      return 'Cacao Pod Borer';
    }

    if (normalizedKey.includes('black pod') ||
        normalizedKey.includes('blackpod') ||
        normalizedKey.includes('phytophthora')) {
      return 'Black Pod Disease';
    }

    if (normalizedKey.includes('mealybug') ||
        normalizedKey.includes('mealy bug')) {
      return 'Mealybug';
    }

    if (normalizedKey.includes('healthy') ||
        normalizedKey.includes('normal') ||
        normalizedKey.includes('no disease')) {
      return 'Healthy';
    }

    return this.formatDiseaseKey(diseaseKey);
  }

  private formatDiseaseKey(diseaseKey: string): string {
    if (!diseaseKey) return 'Unknown';
    return diseaseKey
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
