import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface RenderPageParams {
  pdf: PDFDocumentProxy;
  pageNumber: number;
}

const PDFViewer = ({ pdfUri }: { pdfUri: string }) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        if (typeof window !== "undefined") {
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
          setPdfjsLib(pdfjs);
        }
      } catch (error) {
        const errorMsg = "Failed to load PDF library";
        setError(errorMsg);
      }
    };
    loadPdfjs();
  }, []);

  const renderPage = async ({ pdf, pageNumber }: RenderPageParams) => {
    if (!pdf || !canvasRef.current) return;
    try {
      const page = await pdf.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Failed to get 2D context from canvas");
      }

      const viewport = page.getViewport({ scale: 1.5 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render the PDF page
      await page.render({ canvas, canvasContext: context, viewport }).promise;

      console.log(`Page ${pageNumber} rendered successfully`);
    } catch (error) {
      console.log(`Error rendering page ${pageNumber}:`, error);
      setError(`Failed to render page ${pageNumber}`);
    }
  };

  const loadPdf = useCallback(
    async (pdfUrl: string) => {
      if (!pdfjsLib) return;
      setLoading(true);
      setError("");
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/cmaps/",
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        await renderPage({ pdf, pageNumber: 1 });
      } catch (error) {
        let errorMessage = "Unable to load PDF document.";

        if (error instanceof Error) {
          if (error.message.includes("404")) {
            errorMessage =
              "PDF not found. The document may have been moved or deleted.";
          } else if (error.message.includes("403")) {
            errorMessage =
              "Access denied. You don't have permission to view this PDF.";
          } else if (
            error.message.includes("500") ||
            error.message.includes("503")
          ) {
            errorMessage = "Server error. Please try again later.";
          } else if (
            error.message.includes("network") ||
            error.message.includes("Failed to fetch")
          ) {
            errorMessage =
              "Network error. Please check your internet connection.";
          } else {
            errorMessage = `Failed to load PDF: ${error.message}`;
          }
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [pdfjsLib]
  );

  const goToPage = async (pageNumber: number) => {
    if (!pdfDoc || pageNumber < 1 || pageNumber > totalPages) return;

    console.log(`Navigating from page ${currentPage} to page ${pageNumber}`);

    // Set the current page
    setCurrentPage(pageNumber);

    // Render the new page
    await renderPage({ pdf: pdfDoc, pageNumber });
  };

  const nextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  useEffect(() => {
    if (pdfUri && pdfjsLib) {
      loadPdf(pdfUri);
    }
  }, [pdfUri, pdfjsLib, loadPdf]);

  if (!pdfjsLib) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg border-2 border-border">
          <Loader2 className="mr-2 animate-spin text-primary" size={24} />
          <span className="text-foreground">Loading PDF library...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-lg">
          <div className="flex flex-col gap-3">
            <div className="flex items-center text-destructive">
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
              <span className="font-medium">{error}</span>
            </div>
            {error.includes("not found") && (
              <div className="text-sm text-muted-foreground ml-7">
                The PDF file may have been removed from the server. Please
                contact support if this issue persists.
              </div>
            )}
            {(error.includes("network") || error.includes("Server error")) && (
              <button
                onClick={() => pdfUri && loadPdf(pdfUri)}
                className="ml-7 w-fit flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-border bg-card hover:bg-muted rounded-lg text-foreground transition-colors"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="mb-4 p-4 bg-primary/10 border-2 border-primary/20 rounded-lg">
          <div className="flex items-center justify-center text-primary">
            <Loader2 className="mr-2 animate-spin" size={20} />
            <span>Loading PDF...</span>
          </div>
        </div>
      )}

      {/* PDF Display */}
      <div
        className="border-2 border-border rounded-lg bg-muted/30 overflow-hidden mb-4"
        ref={containerRef}
      >
        <div className="flex justify-center p-4">
          <div className="relative inline-block">
            <canvas
              ref={canvasRef}
              className="block max-w-full h-auto shadow-lg rounded-lg"
              style={{ display: pdfDoc ? "block" : "none" }}
            />
          </div>

          {!pdfDoc && !loading && (
            <div className="text-muted-foreground text-center py-12">
              No PDF loaded. Please provide a PDF URI.
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      {totalPages > 0 && (
        <div className="flex items-center justify-center gap-4 mb-4 p-3 rounded-lg bg-muted/30 border-2 border-border">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1 || loading}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all font-medium"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="font-medium text-foreground px-3">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages || loading}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all font-medium"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
