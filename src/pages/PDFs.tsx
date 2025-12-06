import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, FolderOpen } from 'lucide-react';
import { type PDFExport } from '@/types/crescented';
import { format } from 'date-fns';

const PDFs = () => {
  const [pdfs, setPdfs] = useState<PDFExport[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPDFs = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      const { data } = await supabase
        .from('pdf_exports')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setPdfs(data as PDFExport[]);
      setLoading(false);
    };
    fetchPDFs();
  }, [navigate]);

  const downloadPDF = async (pdf: PDFExport) => {
    try {
      const { data, error } = await supabase.storage.from('pdfs').download(pdf.file_path);
      if (error) throw error;
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdf.metadata.title || 'download.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout loading={loading}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-h1 mb-2">My PDFs</h1>
        <p className="text-muted-foreground mb-8">All your downloaded worksheets and templates</p>

        {pdfs.length === 0 ? (
          <CosmicCard className="p-10 text-center" hover={false}>
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-outfit font-semibold text-lg mb-2">No PDFs yet</h2>
            <p className="text-muted-foreground mb-4">Download worksheets from your modules or tools</p>
            <Link to="/tools"><Button>Go to Tools</Button></Link>
          </CosmicCard>
        ) : (
          <div className="space-y-3">
            {pdfs.map((pdf) => (
              <CosmicCard key={pdf.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-medium">{pdf.metadata.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pdf.metadata.type} • {format(new Date(pdf.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => downloadPDF(pdf)}>
                  <Download className="w-4 h-4" />
                </Button>
              </CosmicCard>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PDFs;
