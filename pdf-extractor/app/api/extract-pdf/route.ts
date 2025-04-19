import { type NextRequest, NextResponse } from "next/server"
import pdfParse from "pdf-parse"
import { PDFIO } from "pdf-io";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const pdfFile = formData.get("pdf") as File

    if (!pdfFile || !pdfFile.type.includes("pdf")) {
      return NextResponse.json({ error: "Please upload a valid PDF file" }, { status: 400 })
    }

    // Convert the file to ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text using pdf-parse
    let text
    try {
      text = await extractTextFromPdf(buffer)
    } catch (error) {
      console.error("Text extraction error:", error)
      text = "Failed to extract text. Error: " + (error instanceof Error ? error.message : String(error))
    }

    // Send the PDF data to the client for image extraction
    const base64Pdf = `data:application/pdf;base64,${buffer.toString("base64")}`


    // Create an instance of PDFIO
    const extractor = new PDFIO(buffer, { isBuffer: true });

    // Extract images from the PDF
    const images = await extractor.extractImages() || [];

    const base64Images: string[] = [];
    for (const image of images) {
      const base64Image = `data:image/png;base64,${Buffer.from(image as Uint8Array).toString("base64")}`;
      base64Images.push(base64Image);
    }

    return NextResponse.json({
      text,
      pdfData: base64Pdf,
      images: base64Images,
    })
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text || "No text content found in the PDF."
  } catch (error) {
    console.error("Error extracting text:", error)
    throw new Error(`Text extraction failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
