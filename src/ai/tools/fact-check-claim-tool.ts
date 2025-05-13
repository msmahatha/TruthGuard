// src/ai/tools/fact-check-claim-tool.ts
'use server';
/**
 * @fileOverview A Genkit tool for fact-checking a single claim using an LLM.
 *
 * - factCheckSingleClaimTool - The tool definition.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {ClaimFactCheckResultSchema} from '@/ai/schemas/claim-fact-check-schema';

const FactCheckClaimInputSchema = z.object({
  claim: z.string().describe('The specific claim to be fact-checked.'),
});

// This prompt is used internally by the tool
const factCheckPrompt = ai.definePrompt({
  name: 'singleClaimFactCheckPrompt',
  input: { schema: FactCheckClaimInputSchema },
  output: { schema: ClaimFactCheckResultSchema.omit({ claim: true }) }, // Tool output should match this, minus the claim itself which is added by the tool
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

export const factCheckSingleClaimTool = ai.defineTool(
  {
    name: 'factCheckSingleClaim',
    description: 'Fact-checks a single textual claim using AI analysis and returns an assessment including truthfulness, confidence, source/reasoning.',
    inputSchema: FactCheckClaimInputSchema,
    outputSchema: ClaimFactCheckResultSchema,
  },
  async (input) => {
    const { output: factCheckDetails } = await factCheckPrompt(input);
    
    if (!factCheckDetails) {
        // Handle cases where the prompt might return null or undefined, though output schema should enforce.
        return {
            claim: input.claim,
            isTrue: undefined, 
            confidenceScore: 0,
            source: "AI assessment failed or inconclusive.",
            reason: "The AI could not provide a conclusive fact-check for this claim."
        };
    }
    
    return {
      claim: input.claim, // Add the original claim back
      isTrue: factCheckDetails.isTrue,
      confidenceScore: factCheckDetails.confidenceScore,
      source: factCheckDetails.source,
      reason: factCheckDetails.reason,
    };
  }
);
