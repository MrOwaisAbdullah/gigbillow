import type { Client, Project, TimeEntry, Invoice } from './types';
import { PlaceHolderImages } from './placeholder-images';

const clientImages = PlaceHolderImages;

export const clients: Client[] = [
  { id: '1', name: 'Innovate Inc.', email: 'contact@innovate.com', avatarUrl: clientImages.find(img => img.id === 'client-1')?.imageUrl || '' },
  { id: '2', name: 'Quantum Solutions', email: 'hello@quantum.dev', avatarUrl: clientImages.find(img => img.id === 'client-2')?.imageUrl || '' },
  { id: '3', name: 'Stellar Services', email: 'support@stellar.io', avatarUrl: clientImages.find(img => img.id === 'client-3')?.imageUrl || '' },
  { id: '4', name: 'Momentum Corp', email: 'mc@momentum.co', avatarUrl: clientImages.find(img => img.id === 'client-4')?.imageUrl || '' },
  { id: '5', name: 'Apex Enterprises', email: 'admin@apex.com', avatarUrl: clientImages.find(img => img.id === 'client-5')?.imageUrl || '' },
];

export const projects: Project[] = [
  { id: 'p1', name: 'Website Redesign', clientId: '1', status: 'active', rate: 75 },
  { id: 'p2', name: 'Mobile App Development', clientId: '2', status: 'active', rate: 90 },
  { id: 'p3', name: 'Branding & Logo Design', clientId: '3', status: 'completed', rate: 60 },
  { id: 'p4', name: 'API Integration', clientId: '4', status: 'on_hold', rate: 85 },
  { id: 'p5', name: 'E-commerce Platform', clientId: '5', status: 'active', rate: 100 },
];

export const timeEntries: TimeEntry[] = [
  { id: 't1', projectId: 'p1', startTime: new Date('2024-07-20T09:00:00'), endTime: new Date('2024-07-20T11:30:00'), description: 'Homepage design mockups', hours: 2.5 },
  { id: 't2', projectId: 'p2', startTime: new Date('2024-07-20T12:00:00'), endTime: new Date('2024-07-20T15:00:00'), description: 'Setup React Native environment', hours: 3 },
  { id: 't3', projectId: 'p1', startTime: new Date('2024-07-21T10:00:00'), endTime: new Date('2024-07-21T14:00:00'), description: 'Develop about us page', hours: 4 },
];

export const invoices: Invoice[] = [
  { id: 'inv1', invoiceNumber: '2024-001', clientId: '3', projectId: 'p3', amount: 1200, issuedDate: new Date('2024-07-15'), dueDate: new Date('2024-07-30'), status: 'paid' },
  { id: 'inv2', invoiceNumber: '2024-002', clientId: '1', projectId: 'p1', amount: 1875, issuedDate: new Date('2024-07-22'), dueDate: new Date('2024-08-05'), status: 'unpaid' },
  { id: 'inv3', invoiceNumber: '2024-003', clientId: '2', projectId: 'p2', amount: 2700, issuedDate: new Date('2024-07-22'), dueDate: new Date('2024-08-05'), status: 'unpaid' },
  { id: 'inv4', invoiceNumber: '2024-004', clientId: '4', projectId: 'p4', amount: 850, issuedDate: new Date('2024-06-10'), dueDate: new Date('2024-06-25'), status: 'overdue' },
];

export const getClientById = (id: string) => clients.find(c => c.id === id);
export const getProjectById = (id: string) => projects.find(p => p.id === id);
