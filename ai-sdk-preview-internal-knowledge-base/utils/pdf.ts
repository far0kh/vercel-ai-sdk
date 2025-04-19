import pdf from "pdf-parse";
import { PDFIO } from "./pdf-io";

export async function getPdfContentFromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdf(buffer);
  console.log('pdf data', data);


  // const pdfFilePath = "path/to/your/pdf/file.pdf";
  console.log(process.cwd());
  const outputDirectory = `${process.cwd()}/public/pdf/images`;

  // Create an instance of PDFIO
  const extractor = new PDFIO(buffer, { isBuffer: true });

  // Extract images from the PDF
  const images = await extractor.extractImages();
  console.log("Extracted images:", images);


  return data.text;
}
