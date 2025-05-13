"use server";

import { factCheckImage, type FactCheckImageOutput } from "@/ai/flows/fact-check-image";
import { summarizeArticle, type SummarizeArticleOutput } from "@/ai/flows/summarize-article";
import { factCheckText, type FactCheckTextOutput } from "@/ai/flows/fact-check-text";

type ActionResponse<T> = 
  | { data: T; error: null }
  | { data: null; error: string };

export async function summarizeArticleUrlAction(articleUrl: string): Promise<ActionResponse<SummarizeArticleOutput>> {
  if (!articleUrl) {
    return { data: null, error: "Article URL is required." };
  }
  try {
    // Validate URL format (basic)
    new URL(articleUrl);
  } catch (e) {
    return { data: null, error: "Invalid URL format provided." };
  }

  try {
    const result = await summarizeArticle({ articleUrl });
    return { data: result, error: null };
  } catch (error: any) {
    console.error("Error in summarizeArticle flow:", error);
    return { data: null, error: error.message || "Failed to summarize article. Please ensure the URL is accessible and points to a valid article." };
  }
}

export async function factCheckImageUrlAction(imageDataUri: string): Promise<ActionResponse<FactCheckImageOutput>> {
  if (!imageDataUri) {
    return { data: null, error: "Image data is required." };
  }
  try {
    const result = await factCheckImage({ imageDataUri });
    return { data: result, error: null };
  } catch (error: any) {
    console.error("Error in factCheckImage flow:", error);
    return { data: null, error: error.message || "Failed to process image. Please try a different image or ensure it's a supported format." };
  }
}

export async function factCheckTextAction(text: string): Promise<ActionResponse<FactCheckTextOutput>> {
   if (!text || text.trim() === "") {
    return { data: null, error: "Text input cannot be empty." };
  }
  
  try {
    const result = await factCheckText({ text });
    return { data: result, error: null };
  } catch (error: any) {
    console.error("Error in factCheckText flow:", error);
    return { data: null, error: error.message || "Failed to process text. Please try again." };
  }
}
