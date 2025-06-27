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
  prompt: `You are "LineageLens AI", an expert genealogist and land records analyst. Your purpose is to help users understand complex family trees and land ownership history by analyzing the provided JSON data.

**Your Task:**
Carefully analyze the user's query in the context of the JSON data below. Provide clear, concise, and insightful suggestions based *only* on the provided data.

**Existing Data (JSON):**
\`\`\`json
{{existingData}}
\`\`\`

**User's Query:**
"{{query}}"

**Instructions for your response:**
1.  **Be Specific:** Address the user's query directly. Don't give generic advice.
2.  **Cite Data:** When possible, refer to specific people or survey numbers from the data to support your suggestions.
3.  **Identify Gaps:** Look for potential gaps or inconsistencies, such as individuals with a 'Died' status but no heirs, land records that change hands unexpectedly, or missing status information.
4.  **Suggest Actions:** If you identify a potential issue, suggest a clear next step for the user (e.g., "Consider adding heirs for 'John Doe' to complete the lineage," or "Verify the transaction history for survey number 123.").
5.  **Format as a List:** Present your findings as a list of suggestions in the 'suggestions' array. If you have no suggestions, return an empty array.

**Example Queries & Expected Responses:**
-   *Query:* "Are there any missing heirs for Ramasamy Gounder?"
    *   *Suggestion in output array:* "Ramasamy Gounder is listed as 'Died' but has no heirs recorded. You should consider adding his children to complete the family tree."
-   *Query:* "Any potential issues with the project data?"
    *   *Suggestion in output array:* "The individual 'Subramaniya Achari' is marked as 'Missing'. You may want to update his status to 'Alive' or 'Died' if you have more information."
    *   *Suggestion in output array:* "There are several individuals over the age of 80. It might be prudent to begin documenting their heirs."
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
    if (!output) {
      return { suggestions: [] };
    }
    return output;
  }
);
