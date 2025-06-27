// src/types/zod.ts
import { z } from 'zod';

export const LandClassificationSchema = z.enum(['Wet', 'Dry', 'Unclassified']);

export const SurveyRecordSchema = z.object({
  id: z.string(),
  surveyNumber: z.string(),
  acres: z.string(),
  cents: z.string(),
  landClassification: LandClassificationSchema,
  googleMapsLink: z.string().url().optional(),
});

// We need a lazy schema for Person because it's recursive
export const PersonSchema: z.ZodType<import('./index').Person> = z.lazy(() => z.object({
  id: z.string(),
  name: z.string(),
  relation: z.string(),
  gender: z.enum(['Male', 'Female', 'Other']),
  age: z.number(),
  maritalStatus: z.enum(['Married', 'Single', 'Divorced', 'Widowed']),
  status: z.enum(['Alive', 'Died', 'Unknown', 'Missing']),
  sourceOfLand: z.string().optional(),
  holdingPattern: z.string().optional(),
  landRecords: z.array(SurveyRecordSchema),
  heirs: z.array(PersonSchema),
}));
