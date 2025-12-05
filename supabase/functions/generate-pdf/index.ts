import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple PDF generation without external library
// Creates a basic text-based PDF
function generateSimplePDF(title: string, type: string, content: string, moduleTitle?: string): Uint8Array {
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Create PDF content
  const header = `🌙 CrescentEd - ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const divider = "═".repeat(50);
  
  const pdfContent = `
${header}
${divider}

TITLE: ${title}
${moduleTitle ? `MODULE: ${moduleTitle}` : ''}
DATE: ${date}

${divider}

${content}

${divider}

© CrescentEd - Empowering Young Entrepreneurs
Generated on ${date}
`;

  // Convert to bytes (simple text file as PDF placeholder)
  // In a real implementation, you'd use a proper PDF library
  const encoder = new TextEncoder();
  return encoder.encode(pdfContent);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, title, content, moduleTitle } = await req.json();
    console.log('Generating PDF:', { type, title });

    const pdfBytes = generateSimplePDF(title, type, content, moduleTitle);

    return new Response(new TextDecoder().decode(pdfBytes), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, '-')}.txt"`,
      },
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
