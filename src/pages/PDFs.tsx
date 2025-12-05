import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, FileText, Download, Trash2 } from 'lucide-react';
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
      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('pdf_exports')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPdfs(data as PDFExport[]);
      }
      setLoading(false);
    };

    fetchPDFs();
  }, [navigate]);

  const downloadPDF = async (pdf: PDFExport) => {
    try {
      const { data, error } = await supabase.storage
        .from('pdfs')
        .download(pdf.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdf.metadata.title || 'download.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error.message || 'Could not download PDF',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise-texture">
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border glass-cosmic">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-sora text-3xl font-bold mb-2">My PDFs</h1>
        <p className="text-muted-foreground mb-8">
          All your downloaded worksheets, templates, and resources
        </p>

        {pdfs.length === 0 ? (
          <div className="glass-cosmic rounded-xl p-10 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-outfit font-semibold text-lg mb-2">No PDFs yet</h2>
            <p className="text-muted-foreground mb-4">
              Download worksheets and templates from your modules to see them here.
            </p>
            <Link to="/dashboard">
              <Button className="bg-primary hover:bg-primary/90">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="glass-cosmic rounded-xl p-5 flex items-center justify-between"
              >
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadPDF(pdf)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PDFs;
