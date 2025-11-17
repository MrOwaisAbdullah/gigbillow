import { supabase } from '@/lib/supabase';
import type { Invoice } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export async function getPublicInvoiceData(invoiceId: string) {
  // Public function - no authentication required
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients!inner(name, email),
      project:projects!inner(name, rate),
      user:users!inner(display_name, photo_url, logo_url, referral_code)
    `)
    .eq('id', invoiceId)
    .single();

  if (error) {
    console.error("Error fetching public invoice data:", error);
    return null;
  }

  return {
    invoice: {
      id: data.id,
      userId: data.user_id,
      clientId: data.client_id,
      projectId: data.project_id,
      invoiceNumber: data.invoice_number,
      amount: parseFloat(data.amount),
      dueDate: data.due_date,
      issuedDate: data.issued_date,
      status: data.status,
      lineItems: data.line_items || [],
      subTotal: parseFloat(data.sub_total),
      taxRate: parseFloat(data.tax_rate),
      discountValue: parseFloat(data.discount_value),
      discountType: data.discount_type,
      paymentUrl: data.payment_url,
      notes: data.notes,
      enhancedSummary: data.enhanced_summary,
      expensesTotal: parseFloat(data.expenses_total),
      createdAt: data.created_at,
      updatedAt: data.updated_at
    },
    client: {
      name: data.client.name,
      email: data.client.email
    },
    project: {
      name: data.project.name,
      rate: data.project.rate
    },
    user: {
      displayName: data.user.display_name,
      photoUrl: data.user.photo_url,
      logoUrl: data.user.logo_url,
      referralCode: data.user.referral_code
    }
  };
}

export async function getInvoices(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: string | null = null,
    pageSize: number = 10
): Promise<{ invoices: Invoice[], nextCursor: string | null, hasNextPage: boolean }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { invoices: [], nextCursor: null, hasNextPage: false };
    }

    let query = supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        client_id,
        project_id,
        amount,
        due_date,
        issued_date,
        status,
        line_items,
        sub_total,
        tax_rate,
        discount_value,
        discount_type,
        payment_url,
        notes,
        enhanced_summary,
        expenses_total
      `)
      .eq('user_id', user.id)
      .order('issued_date', { ascending: false }); // Most recent first

    if (cursor) {
      query = query.gt('id', cursor);
    }

    const { data, error } = await query
      .limit(pageSize + 1); // Fetch one extra to check for next page

    if (error) {
      console.error("Error fetching invoices:", error);
      return { invoices: [], nextCursor: null, hasNextPage: false };
    }

    const hasNextPage = data.length > pageSize;
    const invoices = data.slice(0, pageSize).map(row => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      clientId: row.client_id,
      projectId: row.project_id,
      amount: parseFloat(row.amount),
      dueDate: row.due_date,
      issuedDate: row.issued_date,
      status: row.status,
      lineItems: row.line_items || [],
      subTotal: parseFloat(row.sub_total),
      taxRate: parseFloat(row.tax_rate),
      discountValue: parseFloat(row.discount_value),
      discountType: row.discount_type,
      paymentUrl: row.payment_url,
      notes: row.notes,
      enhancedSummary: row.enhanced_summary,
      expensesTotal: parseFloat(row.expenses_total),
    })) as Invoice[];
    
    const nextCursor = hasNextPage ? data[data.length - 2]?.id : null;

    return {
      invoices,
      nextCursor,
      hasNextPage,
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { invoices: [], nextCursor: null, hasNextPage: false };
  }
}

export async function createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create an invoice.' });
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert([{
      user_id: user.id,
      invoice_number: invoice.invoiceNumber,
      client_id: invoice.clientId,
      project_id: invoice.projectId,
      amount: invoice.amount,
      due_date: invoice.dueDate,
      issued_date: invoice.issuedDate,
      status: invoice.status,
      line_items: invoice.lineItems,
      sub_total: invoice.subTotal,
      tax_rate: invoice.taxRate,
      discount_value: invoice.discountValue,
      discount_type: invoice.discountType,
      payment_url: invoice.paymentUrl,
      notes: invoice.notes,
      enhanced_summary: invoice.enhancedSummary,
      expenses_total: invoice.expensesTotal,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }

  return {
    id: data.id,
    invoiceNumber: data.invoice_number,
    clientId: data.client_id,
    projectId: data.project_id,
    amount: parseFloat(data.amount),
    dueDate: data.due_date,
    issuedDate: data.issued_date,
    status: data.status,
    lineItems: data.line_items || [],
    subTotal: parseFloat(data.sub_total),
    taxRate: parseFloat(data.tax_rate),
    discountValue: parseFloat(data.discount_value),
    discountType: data.discount_type,
    paymentUrl: data.payment_url,
    notes: data.notes,
    enhancedSummary: data.enhanced_summary,
    expensesTotal: parseFloat(data.expenses_total),
  };
}

export async function updateInvoice(id: string, invoice: Partial<Omit<Invoice, 'id'>>): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update an invoice.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('invoices')
    .update({
      invoice_number: invoice.invoiceNumber,
      client_id: invoice.clientId,
      project_id: invoice.projectId,
      amount: invoice.amount,
      due_date: invoice.dueDate,
      issued_date: invoice.issuedDate,
      status: invoice.status,
      line_items: invoice.lineItems,
      sub_total: invoice.subTotal,
      tax_rate: invoice.taxRate,
      discount_value: invoice.discountValue,
      discount_type: invoice.discountType,
      payment_url: invoice.paymentUrl,
      notes: invoice.notes,
      enhanced_summary: invoice.enhancedSummary,
      expenses_total: invoice.expensesTotal,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete an invoice.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error("Error fetching invoice by id:", error);
      return null;
    }

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      clientId: data.client_id,
      projectId: data.project_id,
      amount: parseFloat(data.amount),
      dueDate: data.due_date,
      issuedDate: data.issued_date,
      status: data.status,
      lineItems: data.line_items || [],
      subTotal: parseFloat(data.sub_total),
      taxRate: parseFloat(data.tax_rate),
      discountValue: parseFloat(data.discount_value),
      discountType: data.discount_type,
      paymentUrl: data.payment_url,
      notes: data.notes,
      enhancedSummary: data.enhanced_summary,
      expensesTotal: parseFloat(data.expenses_total),
    };
  } catch (error) {
    console.error("Error fetching invoice by id:", error);
    return null;
  }
}