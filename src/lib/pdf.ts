import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface PDFOptions {
  title: string;
  subtitle?: string;
  content: string | string[];
  type?: 'worksheet' | 'template' | 'checklist' | 'summary';
  saveToStorage?: boolean;
}

// Clean content from asterisks, weird unicode, emojis that break encoding
const cleanContent = (text: string): string => {
  return text
    // Remove asterisks used for markdown bold
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remove common markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}/g, '')
    // Remove problematic unicode
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    // Remove emojis that cause encoding issues (keep basic ones)
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const generatePDF = async ({ title, subtitle, content, type = 'worksheet', saveToStorage = true }: PDFOptions): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  
  // Header gradient background
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
  
  // Title - cleaned
  const cleanTitle = cleanContent(title);
  doc.setTextColor(11, 16, 32); // Deep Space Navy
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  
  const titleLines = doc.splitTextToSize(cleanTitle, maxWidth);
  let yPosition = 60;
  titleLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 10;
  });
  
  // Subtitle - cleaned
  if (subtitle) {
    const cleanSubtitle = cleanContent(subtitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(83, 79, 130); // Midnight Indigo
    const subtitleLines = doc.splitTextToSize(cleanSubtitle, maxWidth);
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
  
  // Content - cleaned
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(47, 72, 88); // Deep Slate
  
  const contentArray = Array.isArray(content) ? content : [content];
  
  contentArray.forEach((section, index) => {
    const cleanSection = cleanContent(section);
    
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 30;
    }
    
    const lines = doc.splitTextToSize(cleanSection, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 30;
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
  
  // Generate filename
  const filename = `${cleanTitle.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}-${type}.pdf`;
  
  // Save to Supabase storage if requested
  if (saveToStorage) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const pdfBlob = doc.output('blob');
        const filePath = `${session.user.id}/${Date.now()}-${filename}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(filePath, pdfBlob, {
            contentType: 'application/pdf',
          });
        
        if (!uploadError) {
          // Save metadata to pdf_exports table
          await supabase.from('pdf_exports').insert({
            user_id: session.user.id,
            file_path: filePath,
            metadata: {
              title: cleanTitle,
              type: type,
              created_at: new Date().toISOString(),
            },
          });
        }
      }
    } catch (error) {
      console.error('Error saving PDF to storage:', error);
    }
  }
  
  // Download the PDF locally
  doc.save(filename);
};

export const generateWorksheetPDF = async (title: string, content: string): Promise<void> => {
  await generatePDF({ title, content, type: 'worksheet' });
};

export const generateTemplatePDF = async (title: string, content: string): Promise<void> => {
  await generatePDF({ title, content, type: 'template' });
};

export const generateChecklistPDF = async (title: string, items: string[]): Promise<void> => {
  const formattedItems = items.map((item, index) => `[ ] ${index + 1}. ${cleanContent(item)}`);
  await generatePDF({ title, content: formattedItems, type: 'checklist' });
};
