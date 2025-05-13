// src/ai/flows/fact-check-image.ts
'use server';
/**
 * @fileOverview Fact-checks claims extracted from images.
 *
 * - factCheckImage - A function that handles fact-checking claims extracted from images.
 * - FactCheckImageInput - The input type for the factCheckImage function.
 * - FactCheckImageOutput - The return type for the factCheckImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {factCheckSingleClaimTool} from '@/ai/tools/fact-check-claim-tool'; 
import {ClaimFactCheckResultSchema} from '@/ai/schemas/claim-fact-check-schema'; 

const FactCheckImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FactCheckImageInput = z.infer<typeof FactCheckImageInputSchema>;

const FactCheckImageOutputSchema = z.object({
  results: z.array(ClaimFactCheckResultSchema), 
});
export type FactCheckImageOutput = z.infer<typeof FactCheckImageOutputSchema>;

export async function factCheckImage(input: FactCheckImageInput): Promise<FactCheckImageOutput> {
  return factCheckImageFlow(input);
}

const extractTextFromImage = ai.definePrompt({
  name: 'extractTextFromImage',
  input: {schema: FactCheckImageInputSchema},
  output: {schema: z.object({extractedText: z.string()})}
  ,
  prompt: `Extract all text from the following image: {{media url=imageDataUri}}`,
});

const identifyClaimsFromImageText = ai.definePrompt({ 
  name: 'identifyClaimsFromImageText', 
  input: {schema: z.object({extractedText: z.string()})},
  output: {schema: z.object({claims: z.array(z.string())})},
  prompt: `From the following text extracted from an image, identify all distinct factual claims that can be reasonably verified or debunked. List each claim as a string.
Extracted Text:
{{{extractedText}}}
`,
});


const factCheckImageFlow = ai.defineFlow(
  {
    name: 'factCheckImageFlow',
    inputSchema: FactCheckImageInputSchema,
    outputSchema: FactCheckImageOutputSchema,
  },
  async (input) => {
    const {output: extractedTextOutput} = await extractTextFromImage(input);
    if (!extractedTextOutput?.extractedText) {
        return {results: []}; 
    }
    const {output: identifiedClaimsOutput} = await identifyClaimsFromImageText({ 
      extractedText: extractedTextOutput.extractedText,
    });

    if (!identifiedClaimsOutput?.claims || identifiedClaimsOutput.claims.length === 0) {
        return {results: []}; 
    }

    const factCheckResultsPromises = identifiedClaimsOutput.claims.map(async (claim) => {
      return factCheckSingleClaimTool({claim}); 
    });
    
    const settledResults = await Promise.allSettled(factCheckResultsPromises);
    
    const successfulResults: z.infer<typeof ClaimFactCheckResultSchema>[] = [];
    settledResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        successfulResults.push(result.value);
      } else if (result.status === 'rejected') {
        console.error("Error fact-checking claim:", result.reason);
        // Optionally, you could include a placeholder error result for this claim
      }
    });

    return {results: successfulResults};
  }
);
