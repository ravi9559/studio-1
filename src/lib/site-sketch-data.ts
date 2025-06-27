
import type { LandClassification } from "@/types";

export type SiteSketchPlot = {
  surveyNumber: string;
  classification: LandClassification;
  ownerName: string;
  status: string; // "Sale Advance", "Pending", "N/A", "Agreement"
  acres: string;
  cents: string;
};

// This is the single source of truth for the site sketch layout and initial data.
export const siteSketchData: SiteSketchPlot[] = [
  // Top Row
  { surveyNumber: '10/1', classification: 'Wet', ownerName: 'Marimuthu Pillai', status: 'Sale Advance', acres: '0', cents: '30' },
  { surveyNumber: '10/2', classification: 'Wet', ownerName: 'Alaghakesan', status: 'Sale Advance', acres: '0', cents: '44' },
  { surveyNumber: '10/3A1', classification: 'Wet', ownerName: 'Alaghakesan', status: 'Sale Advance', acres: '0', cents: '9' },
  { surveyNumber: '10/3A2', classification: 'Wet', ownerName: 'Marimuthu Pillai', status: 'Sale Advance', acres: '0', cents: 'N/A' },
  { surveyNumber: '10/3B', classification: 'Wet', ownerName: 'Marimuthu Pillai', status: 'Sale Advance', acres: '0', cents: '36' },
  { surveyNumber: '9/1', classification: 'Wet', ownerName: 'Kaniappa Achari', status: 'Sale Advance', acres: '0', cents: '54' },
  { surveyNumber: '9/2', classification: 'Wet', ownerName: 'Nanjundan Achari', status: 'Pending', acres: '0', cents: '41' },
  { surveyNumber: '9/3', classification: 'Wet', ownerName: 'Subramaniya Achari', status: 'Sale Advance', acres: '0', cents: '54' },
  { surveyNumber: '9/4', classification: 'Wet', ownerName: 'Annamalai', status: 'Sale Advance', acres: '0', cents: '31' },
  { surveyNumber: '7/3A', classification: 'Wet', ownerName: 'Mani & One', status: 'Pending', acres: '1', cents: '14' },
  { surveyNumber: '8', classification: 'Wet', ownerName: 'Kothandam', status: 'Pending', acres: '0', cents: '75' },
  { surveyNumber: '34/1', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '1', cents: '1' },
  { surveyNumber: '34/2', classification: 'Wet', ownerName: 'Vinayagam', status: 'Sale Advance', acres: '0', cents: '30' },

  // Second Row
  { surveyNumber: '7/1A', classification: 'Wet', ownerName: 'Annamalai', status: 'Sale Advance', acres: '0', cents: '26' },
  { surveyNumber: '7/1B', classification: 'Wet', ownerName: 'Nanjundan Achari', status: 'Pending', acres: '0', cents: '30' },
  { surveyNumber: '7/1D', classification: 'Wet', ownerName: 'Arumugha Naicker', status: 'Pending', acres: '0', cents: '30' },
  { surveyNumber: '7/1E', classification: 'Wet', ownerName: 'Subramaniya Achari', status: 'Pending', acres: '0', cents: '28' },
  { surveyNumber: '7/2A', classification: 'Wet', ownerName: 'Annamalai', status: 'Sale Advance', acres: '0', cents: '47' },
  { surveyNumber: '7/2B', classification: 'Wet', ownerName: 'Marimuthu Achari', status: 'Sale Advance', acres: '0', cents: '49' },
  { surveyNumber: '7/2C', classification: 'Wet', ownerName: 'Sampath', status: 'Sale Advance', acres: '0', cents: '38' },
  { surveyNumber: '7/3B2', classification: 'Wet', ownerName: 'Perumal', status: 'Pending', acres: '0', cents: '54' },
  { surveyNumber: '7/3C1', classification: 'Wet', ownerName: 'Krishnaveni & 4', status: 'Pending', acres: '0', cents: '20' },
  { surveyNumber: '7/3D', classification: 'Wet', ownerName: 'Perumal', status: 'Pending', acres: '0', cents: '9' },
  { surveyNumber: '7/3B1', classification: 'Wet', ownerName: 'Perumal', status: 'Pending', acres: '0', cents: '11' },
  { surveyNumber: '6', classification: 'Wet', ownerName: 'Raman', status: 'Pending', acres: '0', cents: '90' },
  { surveyNumber: '6/3C2', classification: 'Wet', ownerName: 'N/A', status: 'Pending', acres: '0', cents: 'N/A' },
  { surveyNumber: '33/1A2', classification: 'Wet', ownerName: 'Vedhachalam', status: 'Pending', acres: '0', cents: '11' },
  
  // Middle Rows (3-5)
  { surveyNumber: '3/1A', classification: 'Wet', ownerName: 'Kothandam', status: 'Pending', acres: '0', cents: '43' },
  { surveyNumber: '3/1B', classification: 'Wet', ownerName: 'Raman', status: 'Pending', acres: '0', cents: '43' },
  { surveyNumber: '3/1C', classification: 'Wet', ownerName: 'Perumal', status: 'Pending', acres: '0', cents: '45' },
  { surveyNumber: '4/3A', classification: 'Wet', ownerName: 'Chitra Joseph', status: 'Pending', acres: '0', cents: '76' },
  { surveyNumber: '4/3B', classification: 'Wet', ownerName: 'Raghava Naicker', status: 'Pending', acres: '0', cents: '27' },
  { surveyNumber: '4/1A', classification: 'Wet', ownerName: 'Raghava Naicker', status: 'Pending', acres: '0', cents: '49' },
  { surveyNumber: '4/1B', classification: 'Wet', ownerName: 'Nanjundan Achari', status: 'Pending', acres: '0', cents: '55' },
  { surveyNumber: '4/2', classification: 'Wet', ownerName: 'Chitra Joseph', status: 'Pending', acres: '0', cents: '76' },
  { surveyNumber: '5/3A', classification: 'Wet', ownerName: 'Chitra Joseph', status: 'Pending', acres: '0', cents: '27' },
  { surveyNumber: '5/3B', classification: 'Wet', ownerName: 'Jani Investment', status: 'Pending', acres: '0', cents: '80' },
  { surveyNumber: '5/1A', classification: 'Wet', ownerName: 'Raghava Naicker', status: 'Pending', acres: '0', cents: '45' },
  
  // Right side block (col 17+)
  { surveyNumber: '30/1A', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '34' },
  { surveyNumber: '30/2', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '20' },
  { surveyNumber: '30/3A', classification: 'Wet', ownerName: 'Puspavali & 1', status: 'Pending', acres: '0', cents: '35' },
  { surveyNumber: '30/4A', classification: 'Wet', ownerName: 'Puspavali & 1', status: 'Pending', acres: '0', cents: '33' },
  { surveyNumber: '30/4B', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: 'N/A' },
  { surveyNumber: '30/1B', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '37' },
  { surveyNumber: '30/3B', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '25' },
  { surveyNumber: '31/1', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '20' },
  { surveyNumber: '31/2', classification: 'Wet', ownerName: 'Munusamy', status: 'Pending', acres: '0', cents: '15' },
  { surveyNumber: '32', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '28' },
  { surveyNumber: '33/2', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '41' },
  { surveyNumber: '35/3B', classification: 'Wet', ownerName: 'N/A', status: 'Pending', acres: '0', cents: 'N/A' },
  
  // Bottom Rows
  { surveyNumber: '35/1', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '1', cents: '62' },
  { surveyNumber: '35/3A', classification: 'Wet', ownerName: 'Vedhachalam', status: 'Pending', acres: '0', cents: '81' },
  { surveyNumber: '35/2', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '81' },
  { surveyNumber: '36/1', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '40' },
  { surveyNumber: '36/2', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '23' },
  { surveyNumber: '36/3', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '13' },
  { surveyNumber: '37/3A', classification: 'Wet', ownerName: 'Vedhachalam', status: 'Pending', acres: '0', cents: '26' },
  { surveyNumber: '37/1', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '19' },
  { surveyNumber: '37/2A', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '21' },
  { surveyNumber: '37/2B', classification: 'Wet', ownerName: 'Sudha Anand', status: 'Pending', acres: '0', cents: '20' },
  { surveyNumber: '37/3B1', classification: 'Wet', ownerName: 'Sudha Anand', status: 'Pending', acres: '0', cents: '26' },
  { surveyNumber: '37/3B2', classification: 'Wet', ownerName: 'Sudha Anand', status: 'Pending', acres: '0', cents: '55' },

  { surveyNumber: '5/1B1', classification: 'Wet', ownerName: 'Kanniappa Naicker', status: 'Pending', acres: '0', cents: '42' },
  { surveyNumber: '5/1B2', classification: 'Wet', ownerName: 'Raman', status: 'Pending', acres: '0', cents: '42' },
  { surveyNumber: '5/1B3', classification: 'Wet', ownerName: 'Karachi & 1', status: 'Pending', acres: '0', cents: '44' },
  { surveyNumber: '38/1', classification: 'Wet', ownerName: 'Surendran', status: 'Pending', acres: '0', cents: '36' },
  
  { surveyNumber: '38/3', classification: 'Wet', ownerName: 'Surendran', status: 'Pending', acres: '0', cents: '88' },
  { surveyNumber: '39', classification: 'Wet', ownerName: 'Surendran', status: 'Pending', acres: '0', cents: '53' },
  { surveyNumber: '38/4', classification: 'Wet', ownerName: 'Surendran', status: 'Pending', acres: '0', cents: '78' },

  { surveyNumber: '41/1', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '25' },
  { surveyNumber: '41/2', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '21' },
  { surveyNumber: '41/3', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '27' },
  { surveyNumber: '41/4', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '25' },

  { surveyNumber: '33/1A1', classification: 'Wet', ownerName: 'Srinivasan', status: 'Pending', acres: '0', cents: '57' },
  { surveyNumber: '33/1B', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '54' },
  { surveyNumber: '33/3', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: 'N/A', cents: 'N/A' },
];
