import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
// import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const runtime = "edge";

// Before running, follow set-up instructions at
// https://js.langchain.com/v0.2/docs/integrations/vectorstores/supabase

/**
 * This handler takes input text, splits it into chunks, and embeds those chunks
 * into a vector store for later retrieval. See the following docs for more information:
 *
 * https://js.langchain.com/v0.2/docs/how_to/recursive_text_splitter
 * https://js.langchain.com/v0.2/docs/integrations/vectorstores/supabase
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;

  if (process.env.NEXT_PUBLIC_DEMO === "true") {
    return NextResponse.json(
      {
        error: [
          "Ingest is not supported in demo mode.",
          "Please set up your own version of the repo here: https://github.com/langchain-ai/langchain-nextjs-template",
        ].join("\n"),
      },
      { status: 403 },
    );
  }

  try {
    console.log(process.env.SUPABASE_URL);

    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PRIVATE_KEY!,
    );

    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 256,
      chunkOverlap: 20,
    });

    const splitDocuments = await splitter.createDocuments([text]);


    const embeddings = new GoogleGenerativeAIEmbeddings({
      // apiKey: "<YOUR API KEY>",
      modelName: "embedding-001",
    });
    // // Embed a single query
    // const res = await model.embedQuery(
    //   "What would be a good company name for a company that makes colorful socks?"
    // );
    // console.log({ res });

    // const vectorstore = await SupabaseVectorStore.fromDocuments(
    //   splitDocuments,
    //   // new OpenAIEmbeddings(),
    //   // new GoogleGenerativeAIEmbeddings({ model: "text-embedding-004" }),
    //   model,
    //   {
    //     client,
    //     tableName: "documents",
    //     queryName: "match_documents",
    //   },
    // );
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });
    await vectorStore.addDocuments(splitDocuments);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.log(e);

    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
