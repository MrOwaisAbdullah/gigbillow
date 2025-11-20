-- Supabase Schema for OwFlex SaaS Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    referral_code TEXT,
    logo_url TEXT,
    logo_data_url TEXT,
    is_subscribed BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create user_tokens table
CREATE TABLE user_tokens (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    balance INTEGER DEFAULT 0 NOT NULL,
    last_refill_at TIMESTAMP WITH TIME ZONE,
    rollover_limit INTEGER DEFAULT 0 NOT NULL,
    is_subscribed BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create clients table
CREATE TABLE clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT
);

-- Create projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'on_hold')),
    rate NUMERIC DEFAULT 0 NOT NULL
);

-- Create time_entries table
CREATE TABLE time_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    description TEXT,
    hours NUMERIC DEFAULT 0 NOT NULL
);

-- Create invoices table
CREATE TABLE invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    invoice_number TEXT NOT NULL,
    amount NUMERIC DEFAULT 0 NOT NULL,
    due_date DATE NOT NULL,
    issued_date DATE NOT NULL,
    status TEXT DEFAULT 'unpaid' NOT NULL CHECK (status IN ('paid', 'unpaid', 'overdue')),
    line_items JSONB,
    sub_total NUMERIC DEFAULT 0 NOT NULL,
    tax_rate NUMERIC DEFAULT 0 NOT NULL,
    discount_value NUMERIC DEFAULT 0 NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    payment_url TEXT,
    notes TEXT,
    enhanced_summary TEXT,
    expenses_total NUMERIC DEFAULT 0 NOT NULL
);

-- Create expenses table
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    category TEXT CHECK (category IN ('Travel', 'Software', 'Office Supplies', 'Marketing', 'Meals', 'Utilities', 'Other')),
    include_on_invoice BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create referrals table
CREATE TABLE referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_stripe_cust_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    reached_paid BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create feedback table
CREATE TABLE feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_email TEXT,
    feedback_text TEXT NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own data" ON users
    FOR DELETE TO authenticated
    USING (auth.uid() = id);

-- Create RLS policies for user_tokens table
CREATE POLICY "Users can view their own tokens" ON user_tokens
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON user_tokens
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON user_tokens
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON user_tokens
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create RLS policies for clients table
CREATE POLICY "Users can view their own clients" ON clients
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON clients
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON clients
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON clients
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create RLS policies for projects table
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create RLS policies for time_entries table
CREATE POLICY "Users can view their own time entries" ON time_entries
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" ON time_entries
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON time_entries
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" ON time_entries
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create RLS policies for invoices table
CREATE POLICY "Users can view their own invoices" ON invoices
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON invoices
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON invoices
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON invoices
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create RLS policies for expenses table
CREATE POLICY "Users can view their own expenses" ON expenses
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create RLS policies for referrals table
CREATE POLICY "Users can view their own referrals" ON referrals
    FOR SELECT TO authenticated
    USING (auth.uid() = referrer_user_id);

CREATE POLICY "Users can insert their own referrals" ON referrals
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Users can update their own referrals" ON referrals
    FOR UPDATE TO authenticated
    USING (auth.uid() = referrer_user_id)
    WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Users can delete their own referrals" ON referrals
    FOR DELETE TO authenticated
    USING (auth.uid() = referrer_user_id);

-- Create RLS policies for feedback table
CREATE POLICY "Users can view their own feedback" ON feedback
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON feedback
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON feedback
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" ON feedback
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_invoice_id ON expenses(invoice_id);
CREATE INDEX idx_referrals_referrer_user_id ON referrals(referrer_user_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- Create token_transactions table
CREATE TABLE token_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'monthly_refill', 'bonus', 'correction')),
    description TEXT,
    metadata JSONB
);

-- Create RLS policies for token_transactions table
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token transactions" ON token_transactions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);