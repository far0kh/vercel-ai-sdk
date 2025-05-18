import pdf from "pdf-parse";
import { PDFIO } from "./pdf-io";

// Function to detect if text is in RTL language
function isRTLText(text: string): boolean {
  // Check for Arabic and Farsi characters
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlRegex.test(text);
}

// Function to fix RTL text direction
function fixRTLText(text: string): string {
  if (!isRTLText(text)) return text;

  // Split text into lines
  const lines = text.split('\n');

  // Process each line
  return lines.map(line => {
    if (!isRTLText(line)) return line;

    // Split line into words and reverse their order
    const words = line.split(/\s+/);
    return words.reverse().join(' ');
  }).join('\n');
}

export async function getPdfContentFromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdf(buffer);
  console.log('pdf data', data);

  const fixedText = fixRTLText(data.text);

  console.log('pdf data', fixedText);

  // // const pdfFilePath = "path/to/your/pdf/file.pdf";
  // console.log(process.cwd());
  // const outputDirectory = `${process.cwd()}/public/pdf/images`;

  // // Create an instance of PDFIO
  // const extractor = new PDFIO(buffer, { isBuffer: true });

  // // Extract images from the PDF
  // const images = await extractor.extractImages();
  // console.log("Extracted images:", images);


  // return data.text;

  return fixedText;
}
