// src/lib/initial-data.ts
import type { Transaction } from './types';

export const initialTransactions: Omit<Transaction, 'id'>[] = [
    // Transactions for Marimuthu Pillai
    { owner: 'Marimuthu Pillai', sourceName: 'Previous Owner A', mode: 'Purchase', year: 2005, doc: 'DOC-2005-MP1' },
    // Transactions for Kaniappa Achari
    { owner: 'Kaniappa Achari', sourceName: 'Previous Owner B', mode: 'Purchase', year: 1998, doc: 'DOC-1998-KA1' },
    { owner: 'Kaniappa Achari', sourceName: 'Kaniappa\'s Father', mode: 'Legal Heir', year: 1975, doc: 'N/A' },
    // Generic transactions that won't show up unless an owner is named this
    { owner: 'Seller Govindasamy', sourceName: 'Seller Krishnan', mode: 'Purchase', year: 1965, doc: 'DOC-1965-B2' },
];
