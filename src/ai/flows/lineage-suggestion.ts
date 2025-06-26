// lineage-suggestion.ts
'use server';
/**
 * @fileOverview An AI-powered tool that suggests potential lineage connections based on existing data.
 *
 * - suggestLineage - A function that handles the lineage suggestion process.
 * - SuggestLineageInput - The input type for the suggestLineage function.
 * - SuggestLineageOutput - The return type for the suggestLineage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLineageInputSchema = z.object({
  existingData: z
    .string()
    .describe(
      'A string containing existing data about the land, family, and transaction history.'
    ),
  query: z.string().describe('The query to provide the lineage suggestion for.'),
});
export type SuggestLineageInput = z.infer<typeof SuggestLineageInputSchema>;

const SuggestLineageOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of potential lineage suggestions.'),
});
export type SuggestLineageOutput = z.infer<typeof SuggestLineageOutputSchema>;

export async function suggestLineage(input: SuggestLineageInput): Promise<SuggestLineageOutput> {
  return suggestLineageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLineagePrompt',
  input: {schema: SuggestLineageInputSchema},
  output: {schema: SuggestLineageOutputSchema},
  prompt: `You are an expert in family lineage and land ownership history.

  Based on the existing data provided and the user's query, suggest potential lineage connections.

  Existing Data:
  {{existingData}}

  Query:
  {{query}}

  Provide the suggestions in a clear and concise manner.
  Ensure that the suggestions are relevant to the query and based on the existing data.
  Format the output as an array of strings. Each string should be a suggestion.
  `,
});

const suggestLineageFlow = ai.defineFlow(
  {
    name: 'suggestLineageFlow',
    inputSchema: SuggestLineageInputSchema,
    outputSchema: SuggestLineageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
