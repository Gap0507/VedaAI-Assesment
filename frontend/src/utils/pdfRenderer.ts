/**
 * Converts a PDF File into an array of base64 image strings.
 */
export async function renderPdfToImages(file: File): Promise<string[]> {
  if (file.type !== "application/pdf") {
    // If it's already an image, just convert it to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve([reader.result as string]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Dynamically import pdfjs-dist to prevent Next.js SSR errors (like "Iterator is not defined")
  const pdfjsLib = await import("pdfjs-dist");
  
  if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  
  // Load the PDF document
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;
  const images: string[] = [];

  // Render each page to a canvas and convert to base64
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for better OCR quality
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) continue;
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to JPEG base64 (to save payload size compared to PNG)
    const base64Image = canvas.toDataURL("image/jpeg", 0.9);
    images.push(base64Image);
  }

  return images;
}
