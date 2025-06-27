
// src/ai/flows/import-from-sheet.ts
'use server';
/**
 * @fileOverview An AI-powered tool that imports and structures family lineage data from a Google Sheet.
 *
 * - importFromSheet - A function that handles the import process.
 * - ImportFromSheetInput - The input type for the importFromSheet function.
 * - ImportFromSheetOutput - The return type for the importFromSheet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PersonSchema } from '@/types/zod';

const ImportFromSheetInputSchema = z.object({
  sheetUrl: z.string().describe("The public URL of a Google Sheet, published to the web as a CSV."),
});
export type ImportFromSheetInput = z.infer<typeof ImportFromSheetInputSchema>;

const ImportFromSheetOutputSchema = z.object({
  familyHeads: z.array(PersonSchema).describe("The structured array of family heads and their heirs."),
});
export type ImportFromSheetOutput = z.infer<typeof ImportFromSheetOutputSchema>;

const prompt = ai.definePrompt({
  name: 'importFromSheetPrompt',
  input: { schema: z.object({ csvData: z.string() }) },
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
  1.  **Strict Schema Adherence**: The final output MUST be a valid JSON that strictly adheres to the provided schema. No exceptions.
  2.  **No Null or Undefined Values**: No field in the output JSON should have a value of \`null\` or \`undefined\`. This is the most important rule.
  3.  **Default Values**: You MUST handle empty or missing data in the CSV by applying the following defaults. Do not leave fields out unless specified.
      - If 'Relation' is empty for a person, you MUST set it to "Family Head". For an heir, it MUST be specified (e.g., "Son").
      - If 'Gender' is empty, default to "Male".
      - If 'Age' is empty or not a number, default to 40.
      - If 'MaritalStatus' is empty, default to "Married".
      - If 'Status' is empty, default to "Alive".
      - If 'SourceOfLand' is empty, you MUST provide an empty string "" as the value.
      - If 'HoldingPattern' is empty, you MUST provide an empty string "" as the value.
      - If 'Acres' or 'Cents' is empty, you MUST provide an empty string "" as the value.
  4.  **Hierarchy Construction**:
      - Identify all individuals with an empty 'ParentName' as "Family Heads". These will be the root objects in the output array.
      - For all other individuals, find their parent in the dataset using the 'ParentName' column and add them to that parent's 'heirs' array.
  5.  **Data Aggregation**:
      - Aggregate all land records (SurveyNumber, Acres, Cents, etc.) for each person into their 'landRecords' array. A person can own multiple land parcels.
  6.  **Unique IDs**:
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
  async ({ sheetUrl }) => {
    let csvText;
    try {
        const response = await fetch(sheetUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch Google Sheet CSV. Status: ${response.status}. Please ensure the URL is correct and published to the web.`);
        }
        csvText = await response.text();
    } catch (e: any) {
        console.error("Failed to fetch or read CSV from URL:", e);
        throw new Error(`Could not retrieve data from the provided URL. Please verify it's a valid, published Google Sheet CSV link. Error: ${e.message}`);
    }
    
    // Check if CSV is empty or just headers
    if (!csvText || csvText.split('\n').filter(line => line.trim() !== '').length <= 1) {
        throw new Error("The Google Sheet appears to be empty or contains only a header row. Please add data to import.");
    }

    const { output } = await prompt({ csvData: csvText });
    if (!output) {
      throw new Error("The AI failed to generate a valid family tree structure from the provided data.");
    }
    return output;
  }
);


export async function importFromSheet(input: ImportFromSheetInput): Promise<ImportFromSheetOutput> {
  return importFromSheetFlow(input);
}
