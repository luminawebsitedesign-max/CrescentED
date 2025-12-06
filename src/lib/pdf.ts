import { jsPDF } from 'jspdf';

interface PDFOptions {
  title: string;
  subtitle?: string;
  content: string | string[];
  type?: 'worksheet' | 'template' | 'checklist' | 'summary';
}

export const generatePDF = ({ title, subtitle, content, type = 'worksheet' }: PDFOptions): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  
  // Header gradient background (simulated with rectangle)
  doc.setFillColor(198, 51, 94); // #c6335e - Crescent Magenta
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Add gradient overlay effect
  doc.setFillColor(166, 61, 122); // #a63d7a - Arc Rose
  doc.rect(0, 30, pageWidth, 15, 'F');
  
  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('CrescentEd', margin, 15);
  
  // Crescent icon (simple arc)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.circle(pageWidth - margin - 10, 15, 8, 'S');
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth - margin - 7, 13, 6, 'F');
  doc.setFillColor(198, 51, 94);
  doc.circle(pageWidth - margin - 5, 12, 5, 'F');
  
  // Document type badge
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  doc.text(typeLabel.toUpperCase(), margin, 35);
  
  // Title
  doc.setTextColor(11, 16, 32); // Deep Space Navy
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  
  const titleLines = doc.splitTextToSize(title, maxWidth);
  let yPosition = 60;
  titleLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 10;
  });
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(83, 79, 130); // Midnight Indigo
    const subtitleLines = doc.splitTextToSize(subtitle, maxWidth);
    subtitleLines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });
  }
  
  yPosition += 10;
  
  // Divider line
  doc.setDrawColor(198, 51, 94);
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Content
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(47, 72, 88); // Deep Slate
  
  const contentArray = Array.isArray(content) ? content : [content];
  
  contentArray.forEach((section, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 30;
    }
    
    const lines = doc.splitTextToSize(section, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Check for bullet points or numbered items
      if (line.trim().startsWith('•') || line.trim().match(/^\d+\./)) {
        doc.setFont('helvetica', 'normal');
      }
      
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });
    
    if (index < contentArray.length - 1) {
      yPosition += 8;
    }
  });
  
  // Footer
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(currentDate, margin, pageHeight - 10);
    doc.text('CrescentEd', pageWidth - margin, pageHeight - 10, { align: 'right' });
  }
  
  // Save the PDF
  const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${type}.pdf`;
  doc.save(filename);
};

export const generateWorksheetPDF = (title: string, content: string): void => {
  generatePDF({ title, content, type: 'worksheet' });
};

export const generateTemplatePDF = (title: string, content: string): void => {
  generatePDF({ title, content, type: 'template' });
};

export const generateChecklistPDF = (title: string, items: string[]): void => {
  const formattedItems = items.map((item, index) => `☐ ${index + 1}. ${item}`);
  generatePDF({ title, content: formattedItems, type: 'checklist' });
};
