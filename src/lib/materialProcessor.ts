import * as pdfjs from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
};

export const extractTextFromImage = async (file: File): Promise<string> => {
  const { data: { text } } = await Tesseract.recognize(file, 'eng', {
    logger: m => console.log(m)
  });
  return text.trim();
};

export const processStudyMaterial = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    const text = await extractTextFromPDF(file);
    // If text is very short, it might be a scanned PDF, try OCR on pages?
    // For MVP, we'll assume text-based PDFs. 
    // Image-based PDFs would need rendering to canvas then OCR.
    return text;
  } else if (file.type.startsWith('image/')) {
    return await extractTextFromImage(file);
  }
  throw new Error('Unsupported file type');
};
