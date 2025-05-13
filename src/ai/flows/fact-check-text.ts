// src/ai/flows/fact-check-text.ts
'use server';
/**
 * @fileOverview Fact-checks claims extracted from arbitrary text.
 *
 * - factCheckText - A function that handles fact-checking claims from text.
 * - FactCheckTextInput - The input type for the factCheckText function.
 * - FactCheckTextOutput - The return type for the factCheckText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {factCheckSingleClaimTool} from '@/ai/tools/fact-check-claim-tool'; 
import {ClaimFactCheckResultSchema} from '@/ai/schemas/claim-fact-check-schema'; 

const FactCheckTextInputSchema = z.object({
  text: z.string().describe('The text content to be fact-checked.'),
});
export type FactCheckTextInput = z.infer<typeof FactCheckTextInputSchema>;

const FactCheckTextOutputSchema = z.object({
  results: z.array(ClaimFactCheckResultSchema).describe('An array of fact-checked claims found in the text.'),
});
export type FactCheckTextOutput = z.infer<typeof FactCheckTextOutputSchema>;

export async function factCheckText(input: FactCheckTextInput): Promise<FactCheckTextOutput> {
  return factCheckTextFlow(input);
}

const identifyClaimsFromTextPrompt = ai.definePrompt({
  name: 'identifyClaimsFromTextPrompt',
  input: {schema: FactCheckTextInputSchema},
  output: {schema: z.object({claims: z.array(z.string())})},
  prompt: `Analyze the following text and identify all distinct factual claims that can be reasonably verified or debunked. List each claim as a string.
Text:
{{{text}}}
`,
});

const factCheckTextFlow = ai.defineFlow(
  {
    name: 'factCheckTextFlow',
    inputSchema: FactCheckTextInputSchema,
    outputSchema: FactCheckTextOutputSchema,
  },
  async (input: FactCheckTextInput) => {
    const {output: identifiedClaimsOutput} = await identifyClaimsFromTextPrompt(input);

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
        console.error("Error fact-checking claim from text:", result.reason);
        // Optionally, include a placeholder or error indication for this specific claim
        // For now, we just skip failed ones.
      }
    });
    
    return {results: successfulResults};
  }
);
