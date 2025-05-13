// src/ai/schemas/claim-fact-check-schema.ts
import {z} from 'genkit';

export const ClaimFactCheckResultSchema = z.object({
  claim: z.string().describe('The claim that was extracted and fact-checked.'),
  isTrue: z.boolean().optional().describe('Whether the claim is assessed as true, false. Omitted if uncertain or not applicable.'),
  confidenceScore: z
    .number().min(0).max(1)
    .optional()
    .describe('The confidence score (0-1) of the fact-check assessment. Higher means more confident.'),
  source: z.string().optional().describe('A brief description of the source or reasoning basis (e.g., "General knowledge", "Scientific consensus", "No supporting evidence found"). Avoid URLs unless directly verifiable and essential.'),
  reason: z.string().optional().describe('A concise explanation for the fact-check assessment.'),
});

export type ClaimFactCheckResult = z.infer<typeof ClaimFactCheckResultSchema>;

