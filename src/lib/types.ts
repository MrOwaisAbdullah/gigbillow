export type Client = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Project = {
  id: string;
  name: string;
  clientId: string;
  status: 'active' | 'completed' | 'on_hold';
  rate: number;
};

export type TimeEntry = {
  id: string;
  projectId: string;
  startTime: Date;
  endTime: Date | null;
  description: string;
  hours: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string;
  amount: number;
  dueDate: Date;
  issuedDate: Date;
  status: 'paid' | 'unpaid' | 'overdue';
  lineItems: { description: string }[];
  subTotal: number;
  taxRate: number;
  paymentUrl?: string;
  notes?: string;
  enhancedSummary?: string;
};
