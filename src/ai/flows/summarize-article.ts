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

const SummarizeArticleInputSchema = z.object({
  articleUrl: z.string().url().describe('The URL of the article to summarize.'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const FactCheckResultSchema = z.object({
  claim: z.string().describe('A claim extracted from the article.'),
  confidenceScore: z.number().min(0).max(1).describe('The confidence score of the fact-check (0-1).'),
  source: z.string().describe('The trusted source used for fact-checking.'),
  isTrue: z.boolean().describe('Whether the claim is true according to the source.'),
  reason: z.string().describe('Reasoning behind the fact check result')
});

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('A summary of the article.'),
  keyClaims: z.array(z.string()).describe('The key claims extracted from the article.'),
  factChecks: z.array(FactCheckResultSchema).describe('Fact-checked claims with confidence scores and sources.'),
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
  Given the following article URL: {{{articleUrl}}}, summarize the article, extract the key claims, and fact-check those claims against trusted sources. Provide a confidence score (0-1) for each fact-checked claim, along with the source.\n\n  Ensure the factChecks array contains objects that include the claim, confidenceScore, source, and isTrue fields.\n  Ensure that the keyClaims array is populated with the claims extracted from the article.\n  Do not include any additional information in the prompt. The output schema descriptions should be sufficient.\n`,
});

const summarizeArticleFlow = ai.defineFlow(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
  },
  async input => {
    const {output} = await summarizeArticlePrompt(input);
    return output!;
  }
);
