// SummarizeArticle story
'use server';
/**
 * @fileOverview Summarizes a given article, highlights key claims, and fact-checks those claims.
 *
 * - summarizeArticle - A function that summarizes the article, highlights key claims, and fact-checks those claims.
 * - SummarizeArticleInput - The input type for the summarizeArticle function.
 * - SummarizeArticleOutput - The return type for the summarizeArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ClaimFactCheckResultSchema } from '@/ai/schemas/claim-fact-check-schema';

const SummarizeArticleInputSchema = z.object({
  articleUrl: z.string().url().describe('The URL of the article to summarize.'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('A summary of the article.'),
  keyClaims: z.array(z.string()).describe('The key claims extracted from the article.'),
  factChecks: z.array(ClaimFactCheckResultSchema).describe('Fact-checked claims with confidence scores and sources.'),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(input);
}

const summarizeArticlePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {schema: SummarizeArticleInputSchema},
  output: {schema: SummarizeArticleOutputSchema},
  prompt: `You are an expert fact-checker and summarizer of articles.\n
  Given the following article URL: {{{articleUrl}}}, summarize the article, extract the key claims, and fact-check those claims.
  For each fact-checked claim, provide:
  - 'claim': The exact claim.
  - 'isTrue' (optional): boolean, true if likely true, false if likely false. Omit if uncertain.
  - 'confidenceScore' (optional): number (0.0-1.0). Omit if not applicable.
  - 'source' (optional): Brief basis for the check (e.g., "General knowledge", "Reported by multiple news outlets"). Do not invent URLs.
  - 'reason' (optional): Concise explanation.
  Ensure the factChecks array in your output contains objects matching this structure.
  Ensure the keyClaims array is populated with the claims extracted from the article.
  If the article cannot be accessed or processed, return an appropriate empty or error-indicating structure for summary, keyClaims, and factChecks.
  Do not include any additional information in the prompt. The output schema descriptions should be sufficient.\n`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  }
});

const summarizeArticleFlow = ai.defineFlow(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
  },
  async input => {
    const {output} = await summarizeArticlePrompt(input);
    return output || { summary: "Could not generate summary.", keyClaims: [], factChecks: [] };
  }
);
