
// src/types/index.ts

export type LandClassification = 'Wet' | 'Dry' | 'Unclassified';

export type SurveyRecord = {
  id: string;
  surveyNumber: string;
  acres: string;
  cents: string;
  landClassification: LandClassification;
};

export type Person = {
  id: string;
  name: string;
  relation: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  maritalStatus: 'Married' | 'Single' | 'Divorced' | 'Widowed';
  status: 'Alive' | 'Died' | 'Unknown' | 'Missing';
  sourceOfLand?: string;
  landRecords: SurveyRecord[];
  heirs: Person[];
};

export type DocumentFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploaded: string;
  url?: string;
};

export type Note = {
  id: string;
  date: string;
  content: string;
  urls: string[];
};

export type Folder = {
  id: string;
  name: string;
  children: Folder[];
  files: DocumentFile[];
};

export type Project = {
  id: string;
  name: string;
  siteId: string;
  location: string;
  googleMapsLink?: string;
};

// Updated for single admin user
export type User = {
  email: string;
};
export type Role = {}; // No roles needed for now

export type LegalNote = {
  id:string;
  date: string;
  content: string;
  author: {
    id: string; // Keep for data consistency, can be a static value
    name: string;
  };
};

export type Transaction = {
  id: string;
  owner: string;
  sourceName: string;
  mode: 'Purchase' | 'Legal Heir' | 'Gift' | 'Settlement';
  year: number;
  doc: string;
};

export type AggregationDocumentStatus = 'Available' | 'Un-Available' | 'Applied';
export type AggregationCollectionStatus = 'Collected' | 'Pending';

export type AggregationProgress = {
    id: string; // surveyNumber
    titleDeed: { status: AggregationDocumentStatus, collection: AggregationCollectionStatus };
    parentDocument: { status: AggregationDocumentStatus, collection: AggregationCollectionStatus };
    deathCertificate: { status: AggregationDocumentStatus, collection: AggregationCollectionStatus };
    legalHeirCertificate: { status: AggregationDocumentStatus, collection: AggregationCollectionStatus };
    patta: { status: AggregationDocumentStatus, collection: AggregationCollectionStatus };
    saleAgreement: { status: 'Signed' | 'Pending' };
};

export type FinancialTransaction = {
    id: string;
    familyHeadId: string;
    amount: number;
    date: string;
    purpose: 'Token Advance' | 'Part Payment';
    timestamp: string;
};

export type AcquisitionStatus = {
  id: string;
  projectId: string;
  surveyNumber: string;
  familyHeadId: string;
  familyHeadName: string;
  extent: { acres: string; cents: string };
  legal: {
    overallStatus: 'Cleared' | 'Awaiting' | 'On-Progress' | 'Not Started';
  };
};
