"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, AlertCircle, FileText, Download, ImageIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Import PDF.js dynamically on client side
let pdfjsLib: any = null

export default function Home() {
  const [isUploading, setIsUploading] = useState(false)
  const [extractedText, setExtractedText] = useState<string>("")
  const [extractedPages, setExtractedPages] = useState<string[]>([])
  const [extractedImages, setExtractedImages] = useState<string[]>([])
  const [fileName, setFileName] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isExtractingPages, setIsExtractingPages] = useState(false)
  const [isExtractingImages, setIsExtractingImages] = useState(false)
  const [isPdfjsLoaded, setIsPdfjsLoaded] = useState(false)

  // Load PDF.js on client side
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        // Import PDF.js dynamically
        const pdfjs = await import("pdfjs-dist")

        // Set worker source
        // const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry")
        // pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        pdfjsLib = pdfjs
        setIsPdfjsLoaded(true)
      } catch (error) {
        console.error("Error loading PDF.js:", error)
        setError("Failed to load PDF processing library")
      }
    }

    loadPdfjs()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file")
      return
    }

    // Add file size validation
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size exceeds 10MB limit")
      return
    }

    setFileName(file.name)
    setIsUploading(true)
    setIsExtractingImages(true)
    setError(null)
    setExtractedPages([])
    setExtractedImages([])

    const formData = new FormData()
    formData.append("pdf", file)

    try {
      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to process PDF")
      }

      setExtractedText(data.text || "")
      // If we have PDF data, extract pages on the client side
      if (data.pdfData) {
        extractPagesFromPdf(data.pdfData)
      }
      setExtractedImages(data.images || [])
      setIsExtractingImages(false)

    } catch (error) {
      console.error("Error processing PDF:", error)
      setError(error instanceof Error ? error.message : "Failed to process PDF. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const extractPagesFromPdf = async (pdfData: string) => {
    if (!pdfjsLib || !isPdfjsLoaded) {
      setError("PDF processing library is not loaded yet. Please try again.")
      return
    }

    setIsExtractingPages(true)
    setExtractedPages([])

    try {
      // Convert base64 to array buffer
      const base64 = pdfData.replace("data:application/pdf;base64,", "")
      const binaryString = window.atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
      const pages: string[] = []

      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i)

          // const operatorList = await page.getOperatorList();

          // const imgIndex = operatorList.fnArray.indexOf(pdfjsLib.OPS.paintImageXObject);
          // if (imgIndex === -1) {
          //   // No pages found
          //   continue;
          // }
          // const imgArgs = operatorList.argsArray[imgIndex];
          // const { data } = await page.objs.get(imgArgs[0]);
          // console.log(data);


          // page.objs.get(imgArgs[0], async (image: any) => {
          //   // Uint8ClampedArray
          //   const imageUnit8Array = image.data;
          //   const imageWidth = image.width;
          //   const imageHeight = image.height;
          //   console.log('image', image);

          // });


          // operatorList.fnArray.forEach(async (fn: number, j: number) => {
          //   if (fn === pdfjsLib.OPS.paintImageXObject) {
          //     const imgName: string = operatorList.argsArray[j][0];
          //     // const img: any = await page.objs.get(imgName);
          //     // renderImageToCanvas(img);
          //     console.log(`Image found on page ${i}:`, imgName);
          //   }
          // });

          // Create a viewport for rendering
          const viewport = page.getViewport({ scale: 1.0 })

          // Create a canvas for rendering
          const canvas = document.createElement("canvas")
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            console.error("Could not get canvas context")
            continue
          }

          // Render the page to canvas
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise

          // Get the image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          // Create a new canvas for the image
          const imageCanvas = document.createElement("canvas")
          imageCanvas.width = canvas.width
          imageCanvas.height = canvas.height
          const imageContext = imageCanvas.getContext("2d")

          if (!imageContext) {
            console.error("Could not get image canvas context")
            continue
          }

          // Put the image data on the canvas
          imageContext.putImageData(imageData, 0, 0)

          // Convert to base64
          const base64Image = imageCanvas.toDataURL("image/png")
          pages.push(base64Image)
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError)
          // Continue with other pages
        }
      }

      setExtractedPages(pages)
    } catch (error) {
      console.error("Error extracting pages on client:", error)
      setError("Failed to extract pages from PDF. " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsExtractingPages(false)
    }
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">PDF Image Extractor</CardTitle>
          <CardDescription>Upload a PDF file to extract images and text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full">
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF files only (max 10MB)</p>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading || isExtractingPages || isExtractingImages || !isPdfjsLoaded}
                />
              </label>
            </div>

            {(isUploading || isExtractingPages || isExtractingImages) && (
              <div className="w-full flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                <span className="ml-2">{isUploading ? "Processing PDF..." : "Extracting images..."}</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {fileName && !isUploading && !isExtractingPages && !isExtractingImages && (
              <p className="text-sm text-gray-500">
                Selected file: <span className="font-medium">{fileName}</span>
              </p>
            )}

            {(extractedText || extractedPages.length > 0 || extractedImages.length > 0) && (
              <Tabs defaultValue="images" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text">
                    <FileText className="h-4 w-4 mr-2" />
                    Extracted Text
                  </TabsTrigger>
                  <TabsTrigger value="pages">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    PDF Pages ({extractedPages.length})
                  </TabsTrigger>
                  <TabsTrigger value="images">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    PDF Images ({extractedImages.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm text-gray-500">{extractedText || "No text extracted"}</pre>
                      </div>
                      {extractedText && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(extractedText)
                              alert("Text copied to clipboard!")
                            }}
                          >
                            Copy Text
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const blob = new Blob([extractedText], { type: "text/plain" })
                              const url = URL.createObjectURL(blob)
                              const link = document.createElement("a")
                              link.href = url
                              link.download = `${fileName.replace(".pdf", "")}-text.txt`
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                          >
                            Download Text
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="pages" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      {extractedPages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {extractedPages.map((src, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <div className="p-4 flex justify-center">
                                <img
                                  src={src || "/placeholder.svg"}
                                  alt={`PDF page ${index + 1}`}
                                  className="max-w-full h-auto max-h-64"
                                  crossOrigin="anonymous"
                                />
                              </div>
                              <div className="p-2 bg-gray-50 flex justify-between items-center">
                                <span className="text-sm text-gray-500">Page {index + 1}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement("a")
                                    link.href = src
                                    link.download = `page-${index + 1}.png`
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-10 text-gray-500">
                          {isExtractingPages ? "Extracting pages..." : "No pages found in the PDF"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="images" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      {extractedImages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {extractedImages.map((src, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <div className="p-4 flex justify-center">
                                <img
                                  src={src || "/placeholder.svg"}
                                  alt={`PDF image ${index + 1}`}
                                  className="max-w-full h-64 object-contain"
                                  crossOrigin="anonymous"
                                />
                              </div>
                              <div className="p-2 bg-gray-50 flex justify-between items-center">
                                <span className="text-sm text-gray-500">Image {index + 1}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement("a")
                                    link.href = src
                                    link.download = `image-${index + 1}.png`
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-10 text-gray-500">
                          {isExtractingImages ? "Extracting images..." : "No images found in the PDF"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
