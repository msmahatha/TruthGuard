// src/ai/tools/fact-check-claim-tool.ts
'use server';
/**
 * @fileOverview A function for fact-checking a single claim using an LLM.
 *
 * - factCheckSingleClaim - The function to fact-check a claim.
 * - FactCheckSingleClaimInput - The input type for the factCheckSingleClaim.
 * - FactCheckSingleClaimOutput - The output type for the factCheckSingleClaim.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {ClaimFactCheckResultSchema} from '@/ai/schemas/claim-fact-check-schema';

const FactCheckSingleClaimInputSchema = z.object({
  claim: z.string().describe('The specific claim to be fact-checked.'),
});
export type FactCheckSingleClaimInput = z.infer<typeof FactCheckSingleClaimInputSchema>;
export type FactCheckSingleClaimOutput = z.infer<typeof ClaimFactCheckResultSchema>;

// This prompt is used internally by the function
const factCheckPrompt = ai.definePrompt({
  name: 'singleClaimFactCheckInternalPrompt', // Renamed for clarity
  input: { schema: FactCheckSingleClaimInputSchema },
  output: { schema: ClaimFactCheckResultSchema.omit({ claim: true }) }, 
  prompt: `You are an AI fact-checker. Analyze the following claim and provide a fact-check assessment.

Claim: "{{{claim}}}"

Based on your knowledge, assess the claim and provide:
- 'isTrue': boolean (true if likely true, false if likely false, omit if highly uncertain or nuanced).
- 'confidenceScore': number (0.0-1.0 for your confidence in this assessment).
- 'source': A brief description of your reasoning basis (e.g., "General knowledge", "Commonly accepted fact", "Contradicted by widely available data"). Do not invent specific sources or URLs.
- 'reason': A concise explanation for your assessment.

Ensure your output is a JSON object matching the specified schema for 'isTrue', 'confidenceScore', 'source', and 'reason'.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

export async function factCheckSingleClaim(input: FactCheckSingleClaimInput): Promise<FactCheckSingleClaimOutput> {
  const { output: factCheckDetails } = await factCheckPrompt(input);
  
  if (!factCheckDetails) {
      return {
          claim: input.claim,
          isTrue: undefined, 
          confidenceScore: 0,
          source: "AI assessment failed or inconclusive.",
          reason: "The AI could not provide a conclusive fact-check for this claim."
      };
  }
  
  return {
    claim: input.claim, 
    isTrue: factCheckDetails.isTrue,
    confidenceScore: factCheckDetails.confidenceScore,
    source: factCheckDetails.source,
    reason: factCheckDetails.reason,
  };
}
