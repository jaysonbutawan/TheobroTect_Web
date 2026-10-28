import { Injectable } from '@angular/core';
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
  totalScans: number;
  healthyScans: number;
  diseaseCases: number;
  barangayData: BarangayDiseaseCount[];
  diseaseTypes: string[];
}

export interface OfficialSignatories {
  mayorName: string;
  agricultureHeadName: string;
}

@Injectable({
  providedIn: 'root',
})
export class FieldReportPdfService {

  private async getBase64Logo(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
      };
      img.onerror = () => {
        console.warn(`Could not load logo at ${url}. Generating PDF without it.`);
        resolve(null);
      };
      img.src = url;
    });
  }

  aggregateReportData(reports: FieldReport[]): ReportSummary {
    const barangayMap = new Map<string, BarangayDiseaseCount>();
    const diseaseTypesSet = new Set<string>();

    let healthyScans = 0;

    reports.forEach((report) => {
      const normalizedDisease = this.normalizeDiseaseKey(report.disease_key);
      const isHealthy = normalizedDisease === 'Healthy';

      if (isHealthy) {
        healthyScans++;
        return;
      }

      const barangay = report.user_address || 'Unknown';
      const disease = normalizedDisease;
      const severity = report.severity_key?.toLowerCase() || 'mild';

      diseaseTypesSet.add(disease);

      if (!barangayMap.has(barangay)) {
        barangayMap.set(barangay, {
          barangay,
          diseases: {},
          totalCases: 0,
        });
      }

      const barangayData = barangayMap.get(barangay)!;

      if (!barangayData.diseases[disease]) {
        barangayData.diseases[disease] = {
          mild: 0,
          moderate: 0,
          severe: 0,
          total: 0,
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
        day: 'numeric',
      }),
      totalScans: reports.length,
      healthyScans,
      diseaseCases: reports.length - healthyScans,
      barangayData,
      diseaseTypes: Array.from(diseaseTypesSet).sort(),
    };
  }

  async generatePDF(summary: ReportSummary, signatories: OfficialSignatories): Promise<void> {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginLeft = 20;
    const marginRight = 20;
    const contentWidth = pageWidth - marginLeft - marginRight;

    const logoBase64 = await this.getBase64Logo('/Sawata,_Davao_Del_Norte_Official_Seal_Logo.png');

    let yPosition = 35;

    doc.setFillColor(248, 250, 248);
    doc.setDrawColor(61, 104, 58);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginLeft, yPosition, contentWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('REPORT SUMMARY', marginLeft + 5, yPosition + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    doc.text(`Date of Report:`, marginLeft + 5, yPosition + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(summary.reportDate, marginLeft + 32, yPosition + 12);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Total Scans:`, marginLeft + 5, yPosition + 17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(String(summary.totalScans), marginLeft + 32, yPosition + 17);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Healthy Pods:`, pageWidth / 2, yPosition + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text(String(summary.healthyScans), pageWidth / 2 + 25, yPosition + 12);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Disease Cases:`, pageWidth / 2, yPosition + 17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(String(summary.diseaseCases), pageWidth / 2 + 25, yPosition + 17);

    yPosition += 30;

    summary.barangayData.forEach((barangayData) => {
      if (yPosition > pageHeight - 45) {
        doc.addPage();
        yPosition = 35;
      }

      doc.setFillColor(61, 104, 58);
      doc.roundedRect(marginLeft, yPosition, contentWidth, 8, 1, 1, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`BARANGAY: ${barangayData.barangay.toUpperCase()}`, marginLeft + 4, yPosition + 5.5);

      const totalLabel = `Total Cases: ${barangayData.totalCases}`;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const totalLabelWidth = doc.getTextWidth(totalLabel);
      doc.text(totalLabel, pageWidth - marginRight - 4 - totalLabelWidth, yPosition + 5.5);

      yPosition += 8;

      const tableBody: string[][] = [];
      Object.keys(barangayData.diseases)
        .sort()
        .forEach((disease) => {
          const c = barangayData.diseases[disease];
          tableBody.push([disease, String(c.mild), String(c.moderate), String(c.severe), String(c.total)]);
        });

      autoTable(doc, {
        startY: yPosition,
        head: [['Disease Type', 'Mild', 'Moderate', 'Severe', 'Total']],
        body: tableBody,
        theme: 'grid',
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [30, 41, 59],
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 3,
          halign: 'center',
          lineColor: [203, 213, 225],
          lineWidth: 0.1,
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [51, 65, 85],
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'left', fontStyle: 'bold', textColor: [15, 23, 42] },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        },
        margin: { top: 35, bottom: 25, left: marginLeft, right: marginRight },
        tableWidth: contentWidth,
      });

      yPosition = (doc as any).lastAutoTable.finalY + 8;
    });

    const signatureBlockHeight = 40;
    if (yPosition + signatureBlockHeight > pageHeight - 25) {
      doc.addPage();
      yPosition = 35;
    } else {
      yPosition += 10;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('PREPARED AND CERTIFIED BY:', marginLeft, yPosition);

    yPosition += 20;

    const sigWidth = 70;
    const leftSigX = 25;
    const rightSigX = pageWidth - 25 - sigWidth;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(signatories.agricultureHeadName.toUpperCase(), leftSigX + sigWidth / 2, yPosition, { align: 'center' });
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(leftSigX, yPosition + 2, leftSigX + sigWidth, yPosition + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Head, Municipal Agriculture Office', leftSigX + sigWidth / 2, yPosition + 7, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(signatories.mayorName.toUpperCase(), rightSigX + sigWidth / 2, yPosition, { align: 'center' });
    doc.line(rightSigX, yPosition + 2, rightSigX + sigWidth, yPosition + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Municipal Mayor', rightSigX + sigWidth / 2, yPosition + 7, { align: 'center' });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      doc.setFillColor(61, 104, 58);
      doc.rect(0, 0, pageWidth, 25, 'F');

      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 18, 3.5, 18, 18);
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('CACAO DISEASE FIELD REPORT', pageWidth / 2, 13, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(220, 235, 220);
      doc.text('Municipal Department of Agriculture • Sawata, Davao del Norte', pageWidth / 2, 19, { align: 'center' });

      const fY = pageHeight - 15;
      doc.setDrawColor(61, 104, 58);
      doc.setLineWidth(0.5);
      doc.line(marginLeft, fY - 5, pageWidth - marginRight, fY - 5);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      doc.text('Official report generated by TheobroTect System', marginLeft, fY);

      doc.setFont('helvetica', 'normal');
      doc.text(
        `Printed: ${new Date().toLocaleString('en-PH')}`,
        pageWidth / 2,
        fY,
        { align: 'center' }
      );

      doc.setFont('helvetica', 'bold');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - marginRight,
        fY,
        { align: 'right' }
      );
    }

    const fileName = `Field_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  private normalizeDiseaseKey(diseaseKey: string): string {
    if (!diseaseKey) return 'Unknown';

    const normalizedKey = diseaseKey.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();

    if (
      normalizedKey.includes('cacao pod borer') ||
      normalizedKey.includes('pod borer') ||
      normalizedKey.includes('cpb')
    ) {
      return 'Cacao Pod Borer';
    }

    if (
      normalizedKey.includes('black pod') ||
      normalizedKey.includes('blackpod') ||
      normalizedKey.includes('phytophthora')
    ) {
      return 'Black Pod Disease';
    }

    if (normalizedKey.includes('mealybug') || normalizedKey.includes('mealy bug')) {
      return 'Mealybug';
    }

    if (
      normalizedKey.includes('healthy') ||
      normalizedKey.includes('normal') ||
      normalizedKey.includes('no disease')
    ) {
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
