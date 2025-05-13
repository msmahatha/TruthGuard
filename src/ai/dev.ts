import { config } from 'dotenv';
config();

import '@/ai/flows/fact-check-image.ts';
import '@/ai/flows/summarize-article.ts';
import '@/ai/flows/fact-check-text.ts';
// Tools are typically not directly imported here for `genkit start` unless they are also flows.
// The functions within tools are used by flows.
// import '@/ai/tools/fact-check-claim-tool.ts'; // This line is not strictly necessary as it's not a flow.
