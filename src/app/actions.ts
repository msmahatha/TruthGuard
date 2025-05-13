"use server";

import { factCheckImage, type FactCheckImageOutput } from "@/ai/flows/fact-check-image";
import { summarizeArticle, type SummarizeArticleOutput } from "@/ai/flows/summarize-article";

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

export async function factCheckTextAction(text: string): Promise<ActionResponse<string>> {
   if (!text) {
    return { data: null, error: "Text input is required." };
  }
  // This is a placeholder response as direct text fact-checking via a specific AI flow is not available.
  // The AI team needs to provide a flow like `factCheckClaim(claim: string)` or `factCheckTextSnippet(text: string)`.
  // For now, we return an informative message.
  const message = `Direct fact-checking for arbitrary text snippets is currently under development. 
Please use the URL or Image tab for comprehensive analysis. 
The AI flows available are designed to process full articles (via URL) or extract claims from images. 
You entered: "${text.substring(0,100)}${text.length > 100 ? '...' : ''}"`;
  
  // To simulate a successful operation that returns a message to be displayed
  return { data: message, error: null };
}
