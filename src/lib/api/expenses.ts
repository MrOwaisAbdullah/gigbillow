import { supabase } from '@/lib/supabase';
import type { Expense } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export async function getUninvoicedExpensesByProject(projectId: string): Promise<Expense[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      user_id,
      project_id,
      description,
      amount,
      date,
      category,
      include_on_invoice,
      invoice_id,
      created_at,
      updated_at
    `)
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .is('invoice_id', null)  // Expenses not yet assigned to an invoice
    .eq('include_on_invoice', true);  // Only those marked to include on invoice

  if (error) {
    console.error("Error fetching uninvoiced expenses by project:", error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    description: row.description,
    amount: parseFloat(row.amount),
    date: row.date,
    category: row.category as Expense['category'],
    includeOnInvoice: row.include_on_invoice,
    invoiceId: row.invoice_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function markExpensesAsInvoiced(expenseIds: string[], invoiceId: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .update({ invoice_id: invoiceId })
    .in('id', expenseIds);

  if (error) {
    console.error("Error marking expenses as invoiced:", error);
    throw error;
  }
}

export async function getExpenses(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: string | null = null,
    pageSize: number = 10
): Promise<{ expenses: Expense[], nextCursor: string | null, hasNextPage: boolean }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { expenses: [], nextCursor: null, hasNextPage: false };
    }

    let query = supabase
      .from('expenses')
      .select(`
        id,
        project_id,
        description,
        amount,
        date,
        category,
        include_on_invoice,
        invoice_id
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false }); // Most recent first

    if (cursor) {
      query = query.gt('id', cursor);
    }

    const { data, error } = await query
      .limit(pageSize + 1); // Fetch one extra to check for next page

    if (error) {
      console.error("Error fetching expenses:", error);
      return { expenses: [], nextCursor: null, hasNextPage: false };
    }

    const hasNextPage = data.length > pageSize;
    const expenses = data.slice(0, pageSize).map(row => ({
      id: row.id,
      projectId: row.project_id,
      description: row.description,
      amount: parseFloat(row.amount),
      date: row.date,
      category: row.category,
      includeOnInvoice: row.include_on_invoice,
      invoiceId: row.invoice_id,
    })) as Expense[];
    
    const nextCursor = hasNextPage ? data[data.length - 2]?.id : null;

    return {
      expenses,
      nextCursor,
      hasNextPage,
    };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { expenses: [], nextCursor: null, hasNextPage: false };
  }
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create an expense.' });
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      user_id: user.id,
      project_id: expense.projectId,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      include_on_invoice: expense.includeOnInvoice,
      invoice_id: expense.invoiceId,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating expense:", error);
    throw error;
  }

  return {
    id: data.id,
    projectId: data.project_id,
    description: data.description,
    amount: parseFloat(data.amount),
    date: data.date,
    category: data.category,
    includeOnInvoice: data.include_on_invoice,
    invoiceId: data.invoice_id,
  };
}

export async function updateExpense(id: string, expense: Partial<Omit<Expense, 'id'>>): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update an expense.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('expenses')
    .update({
      project_id: expense.projectId,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      include_on_invoice: expense.includeOnInvoice,
      invoice_id: expense.invoiceId,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete an expense.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error("Error fetching expense by id:", error);
      return null;
    }

    return {
      id: data.id,
      projectId: data.project_id,
      description: data.description,
      amount: parseFloat(data.amount),
      date: data.date,
      category: data.category,
      includeOnInvoice: data.include_on_invoice,
      invoiceId: data.invoice_id,
    };
  } catch (error) {
    console.error("Error fetching expense by id:", error);
    return null;
  }
}