// src/lib/initial-data.ts
import type { Task, Transaction, DocumentFile } from './types';


export const initialTasks: Omit<Task, 'id'>[] = [
    { text: 'Review initial land documents', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], completed: true, reminder: false },
    { text: 'Contact legal counsel for opinion', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], completed: false, reminder: true },
    { text: 'Schedule site visit', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], completed: false, reminder: false },
];

export const initialTransactions: Omit<Transaction, 'id'>[] = [
    // Transactions for Marimuthu Pillai
    { owner: 'Marimuthu Pillai', sourceName: 'Previous Owner A', mode: 'Purchase', year: 2005, doc: 'DOC-2005-MP1' },
    // Transactions for Kaniappa Achari
    { owner: 'Kaniappa Achari', sourceName: 'Previous Owner B', mode: 'Purchase', year: 1998, doc: 'DOC-1998-KA1' },
    { owner: 'Kaniappa Achari', sourceName: 'Kaniappa\'s Father', mode: 'Legal Heir', year: 1975, doc: 'N/A' },
    // Generic transactions that won't show up unless an owner is named this
    { owner: 'Seller Govindasamy', sourceName: 'Seller Krishnan', mode: 'Purchase', year: 1965, doc: 'DOC-1965-B2' },
];

export const initialFiles: Omit<DocumentFile, 'id'>[] = [
    { name: 'Sale_Deed_1980.pdf', type: 'PDF', size: '2.3 MB', uploaded: '2023-05-10' },
    { name: 'Patta_Copy.jpeg', type: 'Image', size: '800 KB', uploaded: '2023-05-11' },
    { name: 'EC_1980-2023.pdf', type: 'PDF', size: '5.1 MB', uploaded: '2023-06-01' },
];
