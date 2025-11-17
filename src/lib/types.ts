






export type Client = {
  id: string;
  userId: string; // Foreign key to users table
  name: string;
  email: string;
  avatarUrl: string;
  createdAt?: string; // Supabase timestamp
  updatedAt?: string; // Supabase timestamp
};

export type Project = {
  id: string;
  userId: string; // Foreign key to users table
  clientId: string | null; // Foreign key to clients table (can be null)
  name: string;
  status: 'active' | 'completed' | 'on_hold';
  rate: number;
  createdAt?: string; // Supabase timestamp
  updatedAt?: string; // Supabase timestamp
};

export type TimeEntry = {
  id: string;
  userId: string; // Foreign key to users table
  projectId: string | null; // Foreign key to projects table (can be null)
  startTime: string; // Supabase timestamp as string
  endTime: string | null; // Supabase timestamp as string
  description: string;
  hours: number;
  createdAt?: string; // Supabase timestamp
  updatedAt?: string; // Supabase timestamp
};

export type Invoice = {
  id: string;
  userId: string; // Foreign key to users table
  clientId: string | null; // Foreign key to clients table (can be null)
  projectId: string | null; // Foreign key to projects table (can be null)
  invoiceNumber: string;
  amount: number;
  dueDate: string; // Date string in YYYY-MM-DD format
  issuedDate: string; // Date string in YYYY-MM-DD format
  status: 'paid' | 'unpaid' | 'overdue';
  lineItems: { description: string }[]; // Could be expanded with more fields if needed
  subTotal: number;
  taxRate: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  paymentUrl?: string;
  notes?: string;
  enhancedSummary?: string;
  expensesTotal: number;
  createdAt?: string; // Supabase timestamp
  updatedAt?: string; // Supabase timestamp
};

export type UserToken = {
  userId: string; // Foreign key to users table (primary key)
  balance: number;
  lastRefillAt: string | null; // Supabase timestamp as string
  rolloverLimit: number;
  isSubscribed: boolean;
  createdAt?: string; // Supabase timestamp
  updatedAt?: string; // Supabase timestamp
};

export type TokenPack = {
    id: string;
    stripe_price_id: string;
    tokens: number;
    price_cents: number;
    type: 'one_time' | 'recurring';
};

export type Referral = {
  id: string;
  referrerUserId: string; // Foreign key to users table
  referredStripeCustId: string | null;
  reachedPaid: boolean;
  createdAt?: string; // Supabase timestamp
  updatedAt?: string; // Supabase timestamp
};

export type UserProfile = {
  id: string; // Supabase user ID
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  referralCode: string | null;
  logoUrl?: string;
  logoDataUrl?: string;
  isSubscribed: boolean;
  createdAt?: string; // Supabase timestamp
  updatedAt?: string; // Supabase timestamp
}

export type Expense = {
  id: string;
  userId: string; // Foreign key to users table
  projectId: string | null; // Foreign key to projects table (can be null)
  invoiceId: string | null; // Foreign key to invoices table (can be null)
  description: string;
  amount: number;
  date: string; // Date string in YYYY-MM-DD format
  category: 'Travel' | 'Software' | 'Office Supplies' | 'Marketing' | 'Meals' | 'Utilities' | 'Other';
  includeOnInvoice: boolean;
  createdAt?: string; // Supabase timestamp
  updatedAt?: string; // Supabase timestamp
};

export type Feedback = {
  id: string;
  userId: string | null; // Foreign key to users table (can be null for anonymous feedback)
  userEmail: string | null;
  feedbackText: string;
  createdAt?: string; // Supabase timestamp
  updatedAt?: string; // Supabase timestamp
};
