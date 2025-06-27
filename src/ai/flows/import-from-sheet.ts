
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
  prompt: `You are an expert data processor specializing in genealogical and land ownership data.
  Your task is to parse the provided CSV data, which represents a family tree, and transform it into a hierarchical JSON structure that strictly adheres to the provided schema.

  The CSV has the following columns:
  - Name: The name of the person.
  - Relation: Their relation to their parent (e.g., 'Son', 'Daughter', 'Family Head').
  - Gender: 'Male', 'Female', or 'Other'.
  - Age: The person's age.
  - MaritalStatus: 'Single', 'Married', 'Divorced', 'Widowed'.
  - Status: 'Alive', 'Died', 'Missing', 'Unknown'.
  - SourceOfLand: How the land was acquired (e.g., 'Purchase', 'Inheritance').
  - HoldingPattern: The pattern of land ownership (e.g., 'Joint', 'Individual').
  - ParentName: The name of the parent. This is CRUCIAL for building the hierarchy. If empty, this person is a Family Head.
  - SurveyNumber: The survey number of a land parcel they own.
  - Acres: Acres of the parcel.
  - Cents: Cents of the parcel.
  - Classification: 'Wet', 'Dry', or 'Unclassified'.

  **CRITICAL RULES FOR DATA VALIDATION AND STRUCTURE:**
  1.  **Row Validation**: Before processing a row, you MUST validate it. If a row is completely empty or if the 'Name' column is empty, **you MUST completely ignore that row** and not create any JSON object for it.
  2.  **Strict Schema Adherence**: The final output MUST be a valid JSON that strictly adheres to the provided schema. No exceptions.
  3.  **No Null or Undefined Values**: No field in the output JSON should have a value of \`null\` or \`undefined\`. This is the most important rule.
  4.  **Default Values**: You MUST handle empty or missing data in the CSV by applying the following defaults for every valid person record. Do not leave fields out.
      - If 'Relation' is empty for a person without a 'ParentName', you MUST set it to "Family Head". For an heir, it MUST be specified (e.g., "Son").
      - If 'Gender' is empty, default to "Male".
      - If 'Age' is empty or not a number, default to 40.
      - If 'MaritalStatus' is empty, default to "Married".
      - If 'Status' is empty, default to "Alive".
      - If 'SourceOfLand' is empty, you MUST provide an empty string "" as the value.
      - If 'HoldingPattern' is empty, you MUST provide an empty string "" as the value.
      - If 'Acres' is empty, you MUST provide an empty string "" as the value.
      - If 'Cents' is empty, you MUST provide an empty string "" as the value.
      - If 'Classification' is empty, you MUST default it to "Unclassified".
  5.  **Hierarchy Construction**:
      - Identify all individuals with an empty 'ParentName' as "Family Heads". These will be the root objects in the output array.
      - For all other individuals, find their parent in the dataset using the 'ParentName' column and add them to that parent's 'heirs' array.
  6.  **Data Aggregation**:
      - For each person, aggregate all land records associated with them into their 'landRecords' array. A person can own multiple land parcels, which might appear on different rows with the same name.
  7.  **Unique IDs**:
      - Generate a unique 'id' for each person. A good format is 'person-[name]-[random_number]'.
      - Generate a unique 'id' for each land record. A good format is 'lr-[survey_number]-[person_id]'.

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
