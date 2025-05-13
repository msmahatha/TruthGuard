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

const FactCheckImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FactCheckImageInput = z.infer<typeof FactCheckImageInputSchema>;

const FactCheckImageOutputSchema = z.object({
  results: z.array(
    z.object({
      claim: z.string().describe('The claim that was extracted from the image.'),
      confidenceScore: z
        .number()
        .describe('The confidence score of the fact-check, from 0 to 1.'),
      source: z.string().describe('The source of the fact-check.'),
    })
  ),
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

const identifyClaims = ai.definePrompt({
  name: 'identifyClaims',
  input: {schema: z.object({extractedText: z.string()})},
  output: {schema: z.object({claims: z.array(z.string())})},
  prompt: `Identify all claims in the following text: {{{extractedText}}}`,
});

const factCheckClaim = ai.defineTool({
  name: 'factCheckClaim',
  description: 'Fact-checks a claim against a database of trusted sources.',
  inputSchema: z.object({claim: z.string().describe('The claim to fact-check.')}),
  outputSchema: z.object({
    confidenceScore: z
      .number()
      .describe('The confidence score of the fact-check, from 0 to 1.'),
    source: z.string().describe('The source of the fact-check.'),
  }),
  async fn(input) {
    // TODO: Implement fact-checking logic here.
    // This is a placeholder implementation.
    return {
      confidenceScore: 0.85,
      source: 'www.snopes.com',
    };
  },
});

const factCheckImageFlow = ai.defineFlow(
  {
    name: 'factCheckImageFlow',
    inputSchema: FactCheckImageInputSchema,
    outputSchema: FactCheckImageOutputSchema,
  },
  async input => {
    const {output: extractedTextOutput} = await extractTextFromImage(input);
    const {output: identifiedClaimsOutput} = await identifyClaims({
      extractedText: extractedTextOutput!.extractedText,
    });

    const factCheckResults = await Promise.all(
      identifiedClaimsOutput!.claims.map(async claim => {
        return {
          claim,
          ...(await factCheckClaim({claim})),
        };
      })
    );

    return {results: factCheckResults};
  }
);
