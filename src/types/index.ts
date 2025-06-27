// src/types/index.ts

export type SurveyRecord = {
  id: string;
  surveyNumber: string;
  acres: string;
  cents: string;
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

export type Folder = {
  id: string;
  name: string;
  children: Folder[];
};

export type Project = {
  id: string;
  name: string;
  siteId: string;
  location: string;
};

export type Role = {
    id: string;
    name: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  projectIds?: string[];
};

export type LegalNote = {
  id: string;
  date: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
};
