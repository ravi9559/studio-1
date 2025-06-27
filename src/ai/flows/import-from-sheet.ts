
// src/ai/flows/import-from-sheet.ts
'use server';
/**
 * @fileOverview An AI-powered tool that imports and structures family lineage data from a CSV file.
 *
 * - importFromSheet - A function that handles the import process.
 * - ImportFromSheetInput - The input type for the importFromSheet function.
 * - ImportFromSheetOutput - The return type for the importFromSheet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PersonSchema } from '@/types/zod';

const ImportFromSheetInputSchema = z.object({
  csvData: z.string().describe("The text content of the CSV file."),
});
export type ImportFromSheetInput = z.infer<typeof ImportFromSheetInputSchema>;

const ImportFromSheetOutputSchema = z.object({
  familyHeads: z.array(PersonSchema).describe("The structured array of family heads and their heirs."),
});
export type ImportFromSheetOutput = z.infer<typeof ImportFromSheetOutputSchema>;

const prompt = ai.definePrompt({
  name: 'importFromSheetPrompt',
  input: { schema: ImportFromSheetInputSchema },
  output: { schema: ImportFromSheetOutputSchema },
  prompt: `You are an expert data processor specializing in genealogical and land ownership data. Your task is to parse the provided CSV data and transform it into a hierarchical JSON structure.

**THE ABSOLUTE MOST IMPORTANT RULE: IGNORE INVALID ROWS**
Before you do anything else, you must validate each row of the CSV.
A row is considered **INVALID** and **MUST BE DISCARDED** if:
- The row is completely empty.
- The 'Name' column is empty, blank, or contains only whitespace.

If a row is invalid, you must ignore it completely. Do not create a person object for it, and do not create any land records from it. This rule is more important than any other.

**DATA SCHEMA AND HIERARCHY**
For every **VALID** row, you will create or update person objects according to these rules:

**CSV Columns:**
- Name, Relation, Gender, Age, MaritalStatus, Status, SourceOfLand, HoldingPattern, ParentName, SurveyNumber, Acres, Cents, Classification.

**Hierarchy Construction:**
1.  **Family Heads**: Individuals with an empty 'ParentName' are "Family Heads" and should be the root objects in the final \`familyHeads\` array.
2.  **Heirs**: All other individuals are heirs. Find their parent using the 'ParentName' and add them to the parent's 'heirs' array.
3.  **Data Aggregation**: A person can appear on multiple rows. Aggregate all land records for the same person into their 'landRecords' array.

**DATA FORMATTING AND DEFAULTS (CRITICAL)**
You must strictly adhere to the following formatting rules for every person object you create:
1.  **NO NULLS**: No field in the output JSON should ever be \`null\` or \`undefined\`.
2.  **Default Person Values**:
    - If 'Relation' is empty for a Family Head, set it to "Family Head".
    - If 'Gender' is empty, default to "Male".
    - If 'Age' is empty or not a number, default to 40.
    - If 'MaritalStatus' is empty, default to "Married".
    - If 'Status' is empty, default to "Alive".
    - If 'SourceOfLand' is empty, provide an empty string "".
    - If 'HoldingPattern' is empty, provide an empty string "".
3.  **Default Land Record Values**: If a row contains a \`SurveyNumber\`:
    - If 'Acres' is empty, provide an empty string "".
    - If 'Cents' is empty, provide an empty string "".
    - If 'Classification' is empty, default to "Unclassified".
4.  **Unique IDs**:
    - Generate a unique 'id' for each person (e.g., 'person-[name]-[random_number]').
    - Generate a unique 'id' for each land record (e.g., 'lr-[survey_number]-[person_id]').

**Final Output:**
The final output must be a valid JSON object with a single key, \`familyHeads\`, which is an array of the family head objects you have constructed.

CSV Data to process:
{{{csvData}}}
  `,
});

const importFromSheetFlow = ai.defineFlow(
  {
    name: 'importFromSheetFlow',
    inputSchema: ImportFromSheetInputSchema,
    outputSchema: ImportFromSheetOutputSchema,
  },
  async ({ csvData }) => {
    // Check if CSV data is empty or just headers
    if (!csvData || csvData.split('\n').filter(line => line.trim() !== '').length <= 1) {
        throw new Error("The CSV file appears to be empty or contains only a header row. Please provide a valid CSV file.");
    }

    const { output } = await prompt({ csvData });
    if (!output) {
      throw new Error("The AI failed to generate a valid family tree structure from the provided data.");
    }
    return output;
  }
);


export async function importFromSheet(input: ImportFromSheetInput): Promise<ImportFromSheetOutput> {
  return importFromSheetFlow(input);
}
