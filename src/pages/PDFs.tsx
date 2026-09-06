import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSession, listPdfExports, downloadPdfFile } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demo';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, FolderOpen, ExternalLink, Loader2 } from 'lucide-react';
import { type PDFExport } from '@/types/crescented';
import { format } from 'date-fns';
import SEO from '@/components/SEO';

const PDFs = () => {
  const [pdfs, setPdfs] = useState<PDFExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingPdf, setOpeningPdf] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPDFs = async () => {
      const session = await getSession();
      if (!session) { navigate('/auth'); return; }

      const data = await listPdfExports(session.user.id);
      if (data) setPdfs(data as PDFExport[]);
      setLoading(false);
    };
    fetchPDFs();
  }, [navigate]);

  const openPDF = async (pdf: PDFExport) => {
    setOpeningPdf(pdf.id);
    try {
      const data = await downloadPdfFile(pdf.file_path);

      // Create blob URL and open in new tab
      const url = window.URL.createObjectURL(data);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error: any) {
      toast({ title: 'Failed to open PDF', description: error.message, variant: 'destructive' });
    } finally {
      setOpeningPdf(null);
    }
  };

  const downloadPDF = async (pdf: PDFExport) => {
    try {
      const data = await downloadPdfFile(pdf.file_path);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdf.metadata.title || 'download.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Download started', description: `Downloading ${pdf.metadata.title}` });
    } catch (error: any) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout loading={loading}>
      <SEO
        title="My PDFs — CrescentEd"
        description="Access every worksheet, template, and checklist you've generated in CrescentEd, ready to preview or download."
        path="/pdfs"
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-sora font-bold mb-2">My PDFs</h1>
        <p className="text-muted-foreground mb-8">All your generated worksheets, templates, and exports</p>

        {pdfs.length === 0 ? (
          <CosmicCard className="p-10 text-center" hover={false}>
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-outfit font-semibold text-lg mb-2">No PDFs yet</h2>
            <p className="text-muted-foreground mb-4">
              {DEMO_MODE
                ? 'In this demo, worksheets download straight to your device and nothing is stored on a server, so no history is kept here.'
                : 'Download worksheets from your modules or tools'}
            </p>
            <Link to="/tools"><Button>Go to Tools</Button></Link>
          </CosmicCard>
        ) : (
          <div className="space-y-3">
            {pdfs.map((pdf) => (
              <CosmicCard key={pdf.id} className="p-4 flex items-center justify-between gap-4">
                <div 
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openPDF(pdf)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-outfit font-medium truncate">{pdf.metadata.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pdf.metadata.type} • {format(new Date(pdf.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openPDF(pdf)} 
                    title="Open in new tab"
                    aria-label={`Open ${pdf.metadata.title} in new tab`}
                    disabled={openingPdf === pdf.id}
                  >
                    {openingPdf === pdf.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadPDF(pdf)}
                    title="Download"
                    aria-label={`Download ${pdf.metadata.title}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CosmicCard>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PDFs;
