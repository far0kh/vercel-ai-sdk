import { auth } from "@/app/(auth)/auth";
import { insertChunks } from "@/app/db";
import { getPdfContentFromUrl } from "@/utils/pdf";
import { google } from "@ai-sdk/google";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { put } from "@vercel/blob";
import { embedMany } from "ai";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  let session = await auth();

  if (!session) {
    return Response.redirect("/login");
  }

  const { user } = session;

  if (!user) {
    return Response.redirect("/login");
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  const { downloadUrl } = await put(`${user.email}/${filename}`, request.body, {
    access: "public",
  });

  const content = await getPdfContentFromUrl(downloadUrl);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  const chunkedContent = await textSplitter.createDocuments([content]);
  const loopCount = Math.ceil(chunkedContent.length / 100);

  for (let i = 0; i < loopCount; i++) {
    const start = i * 100;
    const end = Math.min(start + 100, chunkedContent.length);
    const chunk = chunkedContent.slice(start, end);

    console.log(`Chunks ${start} to ${end} of ${chunkedContent.length} created.`);

    // Embed the chunks
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel("text-embedding-004"),
      values: chunk.map((chunk) => chunk.pageContent),
    });
    console.log(`Chunks ${start} to ${end} of ${chunkedContent.length} embedded.`);

    // Insert the chunks into the database
    await insertChunks({
      chunks: chunk.map((chunk, j) => ({
        id: `${user.email}/${filename}/${start + j}`,
        filePath: `${user.email}/${filename}`,
        content: chunk.pageContent.replace(/\u0000/g, ''),
        embedding: embeddings[j],
      })),
    });
    console.log(`Chunks ${start} to ${end} of ${chunkedContent.length} inserted.`);

    // Wait for 1 second to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return Response.json({});
}
