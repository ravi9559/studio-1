// src/lib/initial-data.ts
import type { Task, Transaction, DocumentFile } from './types';


export const initialTasks: Omit<Task, 'id'>[] = [
    { text: 'Review initial land documents', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], completed: true, reminder: false },
    { text: 'Contact legal counsel for opinion', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], completed: false, reminder: true },
    { text: 'Schedule site visit', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], completed: false, reminder: false },
];

export const initialTransactions: Omit<Transaction, 'id'>[] = [
    { owner: 'Kandasamy Gounder (Self)', sourceName: 'Seller Govindasamy', mode: 'Purchase', year: 1980, doc: 'DOC-1980-A1' },
    { owner: 'Seller Govindasamy', sourceName: 'Seller Krishnan', mode: 'Purchase', year: 1965, doc: 'DOC-1965-B2' },
    { owner: 'Seller Krishnan', sourceName: 'Krishnan\'s Father', mode: 'Legal Heir', year: 1940, doc: 'N/A' },
];

export const initialFiles: Omit<DocumentFile, 'id'>[] = [
    { name: 'Sale_Deed_1980.pdf', type: 'PDF', size: '2.3 MB', uploaded: '2023-05-10' },
    { name: 'Patta_Copy.jpeg', type: 'Image', size: '800 KB', uploaded: '2023-05-11' },
    { name: 'EC_1980-2023.pdf', type: 'PDF', size: '5.1 MB', uploaded: '2023-06-01' },
];
