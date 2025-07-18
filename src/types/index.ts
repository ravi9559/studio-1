
// src/types/index.ts

export type LandClassification = 'Wet' | 'Dry' | 'Unclassified';

export type SurveyRecord = {
  id: string;
  surveyNumber: string;
  acres: string;
  cents: string;
  landClassification: LandClassification;
};

export type SurveyRecordWithOwner = SurveyRecord & {
  ownerName: string;
  ownerId: string;
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
  holdingPattern?: string;
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

export type Role = {
    id: string;
    name: 'Super Admin' | 'Aggregator' | 'Lawyer' | 'Client' | 'Investor' | 'Transaction Partner' | 'Co-Aggregator';
};

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role['name'];
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  projectIds?: string[];
  accountType?: 'Individual' | 'Corporate';
};

export type Task = {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
  reminder: boolean;
};

export type LegalNote = {
  id:string;
  date: string;
  content: string;
  author: {
    id: string;
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
    surveyNumber: string;
    amount: number;
    date: string; // ISO date string
    purpose: 'Token Advance' | 'Part Payment';
    timestamp: string; // ISO datetime string
};

export type LegalQueryStatus = 'Resolved' | 'In-Progress' | 'Not Started' | 'Awaiting';

export type LegalQuery = {
    id: string;
    query: string;
    raisedBy: { id: string, name: string };
    date: string; // ISO date string
    status: LegalQueryStatus;
};


export type AcquisitionStatus = {
  id: string; // e.g., `${projectId}-${surveyNumber}-${index}`
  projectId: string;
  surveyNumber: string;
  familyHeadName: string;
  extent: { acres: string; cents: string };
  landClassification: LandClassification;
  legal: {
    overallStatus: 'Cleared' | 'Awaiting' | 'On-Progress' | 'Not Started';
  };
};
