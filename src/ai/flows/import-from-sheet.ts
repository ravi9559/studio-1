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
import Papa from 'papaparse';


const ImportFromSheetInputSchema = z.object({
  sheetUrl: z.string().url().describe("The public URL of a Google Sheet, published to the web as a CSV."),
});
export type ImportFromSheetInput = z.infer<typeof ImportFromSheetInputSchema>;

const ImportFromSheetOutputSchema = z.object({
  familyHeads: z.array(PersonSchema).describe("The structured array of family heads and their heirs."),
});
export type ImportFromSheetOutput = z.infer<typeof ImportFromSheetOutputSchema>;


const fetchCsvFromUrl = ai.defineTool(
    {
        name: 'fetchCsvFromUrl',
        description: 'Fetches the raw text content from a given public CSV URL.',
        inputSchema: z.object({ url: z.string().url() }),
        outputSchema: z.string(),
    },
    async ({ url }) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (e: any) {
            console.error("Failed to fetch CSV URL:", e);
            return `Error fetching data: ${e.message}`;
        }
    }
);


const prompt = ai.definePrompt({
  name: 'importFromSheetPrompt',
  input: { schema: z.object({ csvData: z.string() }) },
  output: { schema: ImportFromSheetOutputSchema },
  tools: [fetchCsvFromUrl],
  prompt: `You are an expert data processor specializing in genealogical and land ownership data.
  Your task is to parse the provided CSV data, which represents a family tree, and transform it into a hierarchical JSON structure.

  The CSV has the following columns:
  - Name: The name of the person.
  - Relation: Their relation to their parent (e.g., 'Son', 'Daughter', 'Family Head').
  - Gender: 'Male', 'Female', or 'Other'.
  - Age: The person's age.
  - MaritalStatus: 'Single', 'Married', 'Divorced', 'Widowed'.
  - Status: 'Alive', 'Died', 'Missing', 'Unknown'.
  - SourceOfLand: How the land was acquired (e.g., 'Purchase', 'Inheritance').
  - ParentName: The name of the parent. This is CRUCIAL for building the hierarchy. If empty, this person is a Family Head.
  - SurveyNumber: The survey number of a land parcel they own.
  - Acres: Acres of the parcel.
  - Cents: Cents of the parcel.
  - Classification: 'Wet', 'Dry', or 'Unclassified'.
  - GoogleMapsLink: A URL to the location on a map.

  RULES:
  1.  Identify all individuals with an empty 'ParentName' as "Family Heads". These will be the root objects in the output array.
  2.  For all other individuals, find their parent in the dataset using the 'ParentName' column and add them to the parent's 'heirs' array.
  3.  Aggregate all land records (SurveyNumber, Acres, Cents, etc.) for each person into their 'landRecords' array. A person can have multiple land records.
  4.  Generate a unique 'id' for each person. A good format is 'person-[name]-[random_number]'.
  5.  Generate a unique 'id' for each land record. A good format is 'lr-[survey_number]-[person_id]'.
  6.  Carefully construct the nested 'heirs' array to represent the family structure accurately.
  7.  Ensure the final output strictly adheres to the provided JSON schema for 'familyHeads'.

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

    const csvText = await fetchCsvFromUrl({ url: sheetUrl });
    
    if (csvText.startsWith('Error')) {
        throw new Error(csvText);
    }
    
    const { output } = await prompt({ csvData: csvText });
    if (!output) {
      throw new Error("The AI failed to generate a valid family tree structure.");
    }
    return output;
  }
);


export async function importFromSheet(input: ImportFromSheetInput): Promise<ImportFromSheetOutput> {
  return importFromSheetFlow(input);
}
