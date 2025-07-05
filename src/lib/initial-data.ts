// src/lib/initial-data.ts
import type { Transaction, User, Role } from './types';

export const initialUsers: User[] = [
    { id: 'user-1682600000001', name: 'O2O Technologies', email: 'admin@o2o.com', password: 'password', role: 'Super Admin', status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'user-1682600000002', name: 'SK Associates', email: 'lawyer@sk.com', password: 'password', role: 'Lawyer', status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'user-1682600000003', name: 'Greenfield Corp', email: 'client@greenfield.com', password: 'password', role: 'Client', status: 'Active' },
    { id: 'user-1682600000004', name: 'Land Investors Inc.', email: 'investor@land.com', password: 'password', role: 'Investor', status: 'Inactive'},
    { id: 'user-1682600000005', name: 'Property Aggregators', email: 'aggregator@prop.com', password: 'password', role: 'Aggregator', status: 'Active' },
];

export const initialRoles: Role[] = [
    { id: 'role-super-admin', name: 'Super Admin' },
    { id: 'role-tx-partner', name: 'Transaction Partner' },
    { id: 'role-investor', name: 'Investor' },
    { id: 'role-aggregator', name: 'Aggregator' },
    { id: 'role-co-aggregator', name: 'Co-Aggregator' },
    { id: 'role-client', name: 'Client' },
    { id: 'role-lawyer', name: 'Lawyer' },
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
