
import type { Transaction } from './types';

// This file is now simplified for a single-user context.
// User and Role data is no longer needed.

export const initialTransactions: Omit<Transaction, 'id'>[] = [
    { owner: 'Marimuthu Pillai', sourceName: 'Previous Owner A', mode: 'Purchase', year: 2005, doc: 'DOC-2005-MP1' },
    { owner: 'Kaniappa Achari', sourceName: 'Previous Owner B', mode: 'Purchase', year: 1998, doc: 'DOC-1998-KA1' },
    { owner: 'Kaniappa Achari', sourceName: 'Kaniappa\'s Father', mode: 'Legal Heir', year: 1975, doc: 'N/A' },
];
