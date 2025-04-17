import { google } from "@ai-sdk/google";
import { experimental_wrapLanguageModel as wrapLanguageModel, LanguageModel } from "ai";
import { ragMiddleware } from "./rag-middleware";

export const customModel = wrapLanguageModel({
  model: google('gemini-2.0-flash') as LanguageModel,
  middleware: ragMiddleware,
});
