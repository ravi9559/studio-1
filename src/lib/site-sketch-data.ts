// src/lib/site-sketch-data.ts

import type { LandClassification } from "@/types";

export type SiteSketchPlot = {
  surveyNumber: string;
  classification?: LandClassification;
  ownerName?: string;
  status?: string;
  acres?: string;
  cents?: string;
  colSpan?: number;
  rowSpan?: number;
};


// This is the single source of truth for the site sketch layout and initial data.
// Empty plots can be represented by a survey number for labeling.
export const siteSketchData: SiteSketchPlot[] = [
  // ROW 1
  { surveyNumber: '10/1' }, { surveyNumber: '10/2' }, { surveyNumber: '10/3A1' }, { surveyNumber: '10/3A2' }, { surveyNumber: '10/3B' }, 
  { surveyNumber: '9/1' }, { surveyNumber: '9/2' }, { surveyNumber: '9/3' }, { surveyNumber: '9/4' }, { surveyNumber: '7/3A' }, 
  { surveyNumber: '8' }, { surveyNumber: '34/1', colSpan: 2 }, { surveyNumber: '34/2' }, 
  { surveyNumber: 'Empty', colSpan: 6 }, // Empty space

  // ROW 2
  { surveyNumber: '7/1A' }, { surveyNumber: '7/1B' }, { surveyNumber: '7/1D' }, { surveyNumber: '7/1E' }, { surveyNumber: '7/2A' },
  { surveyNumber: '7/2B' }, { surveyNumber: '7/2C' }, { surveyNumber: '7/3B2' }, { surveyNumber: '7/3C1' }, { surveyNumber: '7/3D' },
  { surveyNumber: '7/3B1' }, { surveyNumber: '6', colSpan: 2 }, { surveyNumber: '33/1A2' },
  { surveyNumber: 'Empty', colSpan: 6 }, // Empty space

  // ROW 3
  { surveyNumber: '3/1A' }, { surveyNumber: '3/1B' }, { surveyNumber: '3/1C' }, { surveyNumber: '4/3A' }, { surveyNumber: '4/3B' },
  { surveyNumber: '4/1A' }, { surveyNumber: '4/1B' }, { surveyNumber: '4/2' }, { surveyNumber: '5/3A' }, { surveyNumber: '5/3B' },
  { surveyNumber: '5/1A' }, { surveyNumber: 'Empty', colSpan: 9 }, // Empty space

  // ROW 4
  { surveyNumber: 'Empty', colSpan: 11 },
  { surveyNumber: '30/1A', colSpan: 2 }, { surveyNumber: '30/2' }, { surveyNumber: '30/3A' }, { surveyNumber: '30/4A' }, { surveyNumber: '30/4B' }, 
  { surveyNumber: '30/1B' }, { surveyNumber: '30/3B' },
  
  // ROW 5
  { surveyNumber: 'Empty', colSpan: 11 },
  { surveyNumber: '31/1', colSpan: 2 }, { surveyNumber: '31/2' }, { surveyNumber: '32', colSpan: 2 }, { surveyNumber: '33/2', colSpan: 2 },
  { surveyNumber: '35/3B' },

  // ROW 6
  { surveyNumber: '35/1', colSpan: 3 }, { surveyNumber: '35/3A', colSpan: 2 }, { surveyNumber: '35/2', colSpan: 2 },
  { surveyNumber: '36/1', colSpan: 2 }, { surveyNumber: '36/2' }, { surveyNumber: '36/3' },
  { surveyNumber: 'Empty', colSpan: 9 },

  // ROW 7
  { surveyNumber: '37/3A' }, { surveyNumber: '37/1' }, { surveyNumber: '37/2A' }, { surveyNumber: '37/2B' }, { surveyNumber: '37/3B1' },
  { surveyNumber: '37/3B2', colSpan: 2 },
  { surveyNumber: 'Empty', colSpan: 13 },
  
  // ROW 8
  { surveyNumber: '5/1B1' }, { surveyNumber: '5/1B2' }, { surveyNumber: '5/1B3' }, { surveyNumber: '38/1', colSpan: 2 },
  { surveyNumber: 'Empty', colSpan: 15 },
  
  // ROW 9
  { surveyNumber: '38/3', colSpan: 3 }, { surveyNumber: '39' }, { surveyNumber: '38/4', colSpan: 3 },
  { surveyNumber: 'Empty', colSpan: 13 },

  // ROW 10
  { surveyNumber: '41/1' }, { surveyNumber: '41/2' }, { surveyNumber: '41/3' }, { surveyNumber: '41/4' },
  { surveyNumber: 'Empty', colSpan: 2 },
  { surveyNumber: '33/1A1', colSpan: 3 }, { surveyNumber: '33/1B', colSpan: 3 }, { surveyNumber: '33/3', colSpan: 3 },
  { surveyNumber: 'Empty', colSpan: 5 },
];
