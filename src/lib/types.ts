





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
  id:string;
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
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  paymentUrl?: string;
  notes?: string;
  enhancedSummary?: string;
  expensesTotal?: number;
};

export type UserToken = {
    balance: number;
    last_refill_at: Date;
    rollover_limit: number;
    is_subscribed: boolean;
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
    referrer_user_id: string;
    referred_stripe_cust_id: string;
    reached_paid: boolean;
    created_at: Date;
};

export type UserProfile = {
    displayName: string;
    email: string;
    photoURL: string;
    referral_code: string;
    logoUrl?: string;
    logoDataUrl?: string;
    is_subscribed: boolean;
}

export type Expense = {
  id: string;
  projectId: string | null;
  description: string;
  amount: number;
  date: Date;
  category: 'Travel' | 'Software' | 'Office Supplies' | 'Marketing' | 'Meals' | 'Utilities' | 'Other';
  includeOnInvoice: boolean;
  invoiceId: string | null;
};

export type Feedback = {
  id: string;
  userId: string;
  userEmail: string;
  feedbackText: string;
  createdAt: Date;
};
