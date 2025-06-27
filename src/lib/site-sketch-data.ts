
import type { LandClassification } from "@/types";

export type SiteSketchPlot = {
  surveyNumber: string;
  classification: LandClassification;
  ownerName: string;
  status: string; // "Sale Advance", "Pending", "N/A", "Agreement"
  acres: string;
  cents: string;
  gridClass: string;
};

// This is the single source of truth for the site sketch layout and initial data.
export const siteSketchData: SiteSketchPlot[] = [
  // Top Row
  { surveyNumber: '10/1', classification: 'Wet', ownerName: 'Marimuthu Pillai', status: 'Sale Advance', acres: '0', cents: '30', gridClass: 'col-start-1 col-span-2 row-start-1' },
  { surveyNumber: '10/2', classification: 'Wet', ownerName: 'Alaghakesan', status: 'Sale Advance', acres: '0', cents: '44', gridClass: 'col-start-3 col-span-1 row-start-1' },
  { surveyNumber: '10/3A1', classification: 'Wet', ownerName: 'Alaghakesan', status: 'Sale Advance', acres: '0', cents: '9', gridClass: 'col-start-4 col-span-1 row-start-1' },
  { surveyNumber: '10/3A2', classification: 'Wet', ownerName: 'Marimuthu Pillai', status: 'Sale Advance', acres: '0', cents: 'N/A', gridClass: 'col-start-5 col-span-1 row-start-1' },
  { surveyNumber: '10/3B', classification: 'Wet', ownerName: 'Marimuthu Pillai', status: 'Sale Advance', acres: '0', cents: '36', gridClass: 'col-start-6 col-span-1 row-start-1' },
  { surveyNumber: '9/1', classification: 'Wet', ownerName: 'Kaniappa Achari', status: 'Sale Advance', acres: '0', cents: '54', gridClass: 'col-start-7 col-span-2 row-start-1' },
  { surveyNumber: '9/2', classification: 'Wet', ownerName: 'Nanjundan Achari', status: 'Pending', acres: '0', cents: '41', gridClass: 'col-start-9 col-span-1 row-start-1' },
  { surveyNumber: '9/3', classification: 'Wet', ownerName: 'Subramaniya Achari', status: 'Sale Advance', acres: '0', cents: '54', gridClass: 'col-start-10 col-span-2 row-start-1' },
  { surveyNumber: '9/4', classification: 'Wet', ownerName: 'Annamalai', status: 'Sale Advance', acres: '0', cents: '31', gridClass: 'col-start-12 col-span-1 row-start-1' },
  { surveyNumber: '7/3A', classification: 'Wet', ownerName: 'Mani & One', status: 'Pending', acres: '1', cents: '14', gridClass: 'col-start-13 col-span-2 row-start-1' },
  { surveyNumber: '8', classification: 'Wet', ownerName: 'Kothandam', status: 'Pending', acres: '0', cents: '75', gridClass: 'col-start-15 col-span-2 row-start-1' },
  { surveyNumber: '34/1', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '1', cents: '1', gridClass: 'col-start-17 col-span-2 row-start-1' },
  { surveyNumber: '34/2', classification: 'Wet', ownerName: 'Vinayagam', status: 'Sale Advance', acres: '0', cents: '30', gridClass: 'col-start-19 col-span-2 row-start-1' },

  // Second Row
  { surveyNumber: '7/1A', classification: 'Wet', ownerName: 'Annamalai', status: 'Sale Advance', acres: '0', cents: '26', gridClass: 'col-start-1 col-span-1 row-start-2' },
  { surveyNumber: '7/1B', classification: 'Wet', ownerName: 'Nanjundan Achari', status: 'Pending', acres: '0', cents: '30', gridClass: 'col-start-2 col-span-1 row-start-2' },
  { surveyNumber: '7/1C', classification: 'Wet', ownerName: 'Arumugha Naicker', status: 'Sale Advance', acres: '0', cents: '26', gridClass: 'col-start-3 col-span-1 row-start-2' },
  { surveyNumber: '7/1D', classification: 'Wet', ownerName: 'N/A', status: 'Agreement', acres: '0', cents: '30', gridClass: 'col-start-4 col-span-1 row-start-2' },
  { surveyNumber: '7/1E', classification: 'Wet', ownerName: 'Subramaniya Achari', status: 'Pending', acres: '0', cents: '28', gridClass: 'col-start-5 col-span-1 row-start-2' },
  { surveyNumber: '7/2A', classification: 'Wet', ownerName: 'Annamalai', status: 'Sale Advance', acres: '0', cents: '47', gridClass: 'col-start-6 col-span-1 row-start-2' },
  { surveyNumber: '7/2B', classification: 'Wet', ownerName: 'Marimuthu Achari', status: 'Sale Advance', acres: '0', cents: '49', gridClass: 'col-start-7 col-span-1 row-start-2' },
  { surveyNumber: '7/2C', classification: 'Wet', ownerName: 'Sampath', status: 'Sale Advance', acres: '0', cents: '38', gridClass: 'col-start-8 col-span-1 row-start-2' },
  { surveyNumber: '7/3B2', classification: 'Wet', ownerName: 'Perumal', status: 'Pending', acres: '0', cents: '54', gridClass: 'col-start-9 col-span-2 row-start-2' },
  { surveyNumber: '7/3C1', classification: 'Wet', ownerName: 'Krishnaveni & 4', status: 'Pending', acres: '0', cents: '20', gridClass: 'col-start-11 col-span-1 row-start-2' },
  { surveyNumber: '7/3D', classification: 'Wet', ownerName: 'Perumal', status: 'Pending', acres: '0', cents: '9', gridClass: 'col-start-12 col-span-1 row-start-2' },
  { surveyNumber: '7/3B1', classification: 'Wet', ownerName: 'Perumal', status: 'Pending', acres: '0', cents: '11', gridClass: 'col-start-13 col-span-1 row-start-2' },
  { surveyNumber: '6', classification: 'Wet', ownerName: 'Raman', status: 'Pending', acres: '0', cents: '90', gridClass: 'col-start-14 col-span-2 row-start-2' },
  { surveyNumber: '6/3C2', classification: 'Wet', ownerName: 'N/A', status: 'Pending', acres: '0', cents: 'N/A', gridClass: 'col-start-16 col-span-1 row-start-2' },
  { surveyNumber: '33/1A2', classification: 'Wet', ownerName: 'Vedhachalam', status: 'Pending', acres: '0', cents: '11', gridClass: 'col-start-17 col-span-1 row-start-2' },
  
  // Middle Rows (3-5)
  { surveyNumber: '3/1A', classification: 'Wet', ownerName: 'Kothandam', status: 'Pending', acres: '0', cents: '43', gridClass: 'col-start-1 col-span-2 row-start-4' },
  { surveyNumber: '3/1B', classification: 'Wet', ownerName: 'Raman', status: 'Pending', acres: '0', cents: '43', gridClass: 'col-start-3 col-span-2 row-start-4' },
  { surveyNumber: '3/1C', classification: 'Wet', ownerName: 'Perumal', status: 'Pending', acres: '0', cents: '45', gridClass: 'col-start-5 col-span-2 row-start-4' },
  { surveyNumber: '4/3A', classification: 'Wet', ownerName: 'Chitra Joseph', status: 'Pending', acres: '0', cents: '76', gridClass: 'col-start-1 col-span-3 row-start-5' },
  { surveyNumber: '4/3B', classification: 'Wet', ownerName: 'Raghava Naicker', status: 'Pending', acres: '0', cents: '27', gridClass: 'col-start-4 col-span-3 row-start-5' },
  { surveyNumber: '4/1A', classification: 'Wet', ownerName: 'Raghava Naicker', status: 'Pending', acres: '0', cents: '49', gridClass: 'col-start-1 col-span-2 row-start-6' },
  { surveyNumber: '4/1B', classification: 'Wet', ownerName: 'Nanjundan Achari', status: 'Pending', acres: '0', cents: '55', gridClass: 'col-start-3 col-span-2 row-start-6' },
  { surveyNumber: '4/2', classification: 'Wet', ownerName: 'Chitra Joseph', status: 'Pending', acres: '0', cents: '76', gridClass: 'col-start-5 col-span-2 row-start-6' },
  { surveyNumber: '5/3A', classification: 'Wet', ownerName: 'Chitra Joseph', status: 'Pending', acres: '0', cents: '27', gridClass: 'col-start-1 col-span-2 row-start-7' },
  { surveyNumber: '5/3B', classification: 'Wet', ownerName: 'Jani Investment', status: 'Pending', acres: '0', cents: '80', gridClass: 'col-start-3 col-span-2 row-start-7' },
  { surveyNumber: '5/1A', classification: 'Wet', ownerName: 'Raghava Naicker', status: 'Pending', acres: '0', cents: '45', gridClass: 'col-start-5 col-span-2 row-start-7' },
  
  // Right side block (col 17+)
  { surveyNumber: '30/1A', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '34', gridClass: 'col-start-17 col-span-2 row-start-3' },
  { surveyNumber: '30/2', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '20', gridClass: 'col-start-19 col-span-2 row-start-3' },
  { surveyNumber: '30/3A', classification: 'Wet', ownerName: 'Puspavali & 1', status: 'Pending', acres: '0', cents: '35', gridClass: 'col-start-17 col-span-2 row-start-4' },
  { surveyNumber: '30/4A', classification: 'Wet', ownerName: 'Puspavali & 1', status: 'Pending', acres: '0', cents: '33', gridClass: 'col-start-19 col-span-2 row-start-4' },
  { surveyNumber: '30/4B', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: 'N/A', gridClass: 'col-start-17 col-span-2 row-start-5' },
  { surveyNumber: '30/1B', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '37', gridClass: 'col-start-19 col-span-2 row-start-5' },
  { surveyNumber: '30/3B', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '25', gridClass: 'col-start-17 col-span-2 row-start-6' },
  { surveyNumber: '31/1', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '20', gridClass: 'col-start-19 col-span-2 row-start-6' },
  { surveyNumber: '31/2', classification: 'Wet', ownerName: 'Munusamy', status: 'Pending', acres: '0', cents: '15', gridClass: 'col-start-17 col-span-2 row-start-7' },
  { surveyNumber: '32', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '28', gridClass: 'col-start-19 col-span-2 row-start-7' },
  { surveyNumber: '33/2', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '41', gridClass: 'col-start-17 col-span-2 row-start-8' },
  { surveyNumber: '35/3B', classification: 'Wet', ownerName: 'N/A', status: 'Pending', acres: '0', cents: 'N/A', gridClass: 'col-start-19 col-span-2 row-start-8' },
  
  // Bottom Rows
  { surveyNumber: '35/1', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '1', cents: '62', gridClass: 'col-start-13 col-span-2 row-start-4' },
  { surveyNumber: '35/3A', classification: 'Wet', ownerName: 'Vedhachalam', status: 'Pending', acres: '0', cents: '81', gridClass: 'col-start-15 col-span-2 row-start-4' },
  { surveyNumber: '35/2', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '81', gridClass: 'col-start-13 col-span-2 row-start-5' },
  { surveyNumber: '36/1', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '40', gridClass: 'col-start-13 col-span-1 row-start-6' },
  { surveyNumber: '36/2', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '23', gridClass: 'col-start-14 col-span-1 row-start-6' },
  { surveyNumber: '36/3', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '13', gridClass: 'col-start-15 col-span-1 row-start-6' },
  { surveyNumber: '37/3A', classification: 'Wet', ownerName: 'Vedhachalam', status: 'Pending', acres: '0', cents: '26', gridClass: 'col-start-16 col-span-1 row-start-6' },
  { surveyNumber: '37/1', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '19', gridClass: 'col-start-13 col-span-1 row-start-7' },
  { surveyNumber: '37/2A', classification: 'Wet', ownerName: 'Anitha Kamalabal', status: 'Pending', acres: '0', cents: '21', gridClass: 'col-start-14 col-span-1 row-start-7' },
  { surveyNumber: '37/2B', classification: 'Wet', ownerName: 'Sudha Anand', status: 'Pending', acres: '0', cents: '20', gridClass: 'col-start-15 col-span-1 row-start-7' },
  { surveyNumber: '37/3B1', classification: 'Wet', ownerName: 'Sudha Anand', status: 'Pending', acres: '0', cents: '26', gridClass: 'col-start-16 col-span-1 row-start-7' },
  { surveyNumber: '37/3B2', classification: 'Wet', ownerName: 'Sudha Anand', status: 'Pending', acres: '0', cents: '55', gridClass: 'col-start-13 col-span-2 row-start-8' },

  { surveyNumber: '5/1B1', classification: 'Wet', ownerName: 'Kanniappa Naicker', status: 'Pending', acres: '0', cents: '42', gridClass: 'col-start-7 col-span-1 row-start-7' },
  { surveyNumber: '5/1B2', classification: 'Wet', ownerName: 'Raman', status: 'Pending', acres: '0', cents: '42', gridClass: 'col-start-8 col-span-1 row-start-7' },
  { surveyNumber: '5/1B3', classification: 'Wet', ownerName: 'Karachi & 1', status: 'Pending', acres: '0', cents: '44', gridClass: 'col-start-9 col-span-1 row-start-7' },
  { surveyNumber: '38/1', classification: 'Wet', ownerName: 'Surendran', status: 'Pending', acres: '0', cents: '36', gridClass: 'col-start-10 col-span-1 row-start-7' },
  
  { surveyNumber: '38/3', classification: 'Wet', ownerName: 'Surendran', status: 'Pending', acres: '0', cents: '88', gridClass: 'col-start-7 col-span-2 row-start-8' },
  { surveyNumber: '39', classification: 'Wet', ownerName: 'Surendran', status: 'Pending', acres: '0', cents: '53', gridClass: 'col-start-9 col-span-2 row-start-8' },
  { surveyNumber: '38/4', classification: 'Wet', ownerName: 'Surendran', status: 'Pending', acres: '0', cents: '78', gridClass: 'col-start-7 col-span-4 row-start-9' },

  { surveyNumber: '41/1', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '25', gridClass: 'col-start-7 col-span-1 row-start-10' },
  { surveyNumber: '41/2', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '21', gridClass: 'col-start-8 col-span-1 row-start-10' },
  { surveyNumber: '41/3', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '27', gridClass: 'col-start-9 col-span-1 row-start-10' },
  { surveyNumber: '41/4', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '25', gridClass: 'col-start-10 col-span-1 row-start-10' },

  { surveyNumber: '33/1A1', classification: 'Wet', ownerName: 'Srinivasan', status: 'Pending', acres: '0', cents: '57', gridClass: 'col-start-13 col-span-2 row-start-3' },
  { surveyNumber: '33/1B', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: '0', cents: '54', gridClass: 'col-start-15 col-span-2 row-start-3' },
  { surveyNumber: '33/3', classification: 'Wet', ownerName: 'VRV Imports & Exports', status: 'Pending', acres: 'N/A', cents: 'N/A', gridClass: 'col-start-16 col-span-1 row-start-3' },
];

    