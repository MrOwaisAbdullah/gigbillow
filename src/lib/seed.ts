import { supabase } from '@/lib/supabase';
import { type Client, type Project, type Invoice, type Expense } from '@/lib/types';

export async function seedSampleData(userId: string) {
  // Sample client
  const sampleClient: Omit<Client, 'id'> = {
    userId: userId,
    name: 'Acme Corporation',
    email: 'contact@acmecorp.com',
    avatarUrl: 'https://ui-avatars.com/api/?name=Acme+Corp&background=0D8ABC&color=fff',
  };

  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .insert([{ ...sampleClient, user_id: userId }])
    .select()
    .single();

  if (clientError) {
    console.error('Error creating sample client:', clientError);
    throw clientError;
  }

  // Sample project
  const sampleProject: Omit<Project, 'id'> = {
    userId: userId,
    name: 'Website Redesign',
    clientId: clientData.id,
    status: 'active',
    rate: 75,
  };

  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .insert([{ ...sampleProject, user_id: userId }])
    .select()
    .single();

  if (projectError) {
    console.error('Error creating sample project:', projectError);
    throw projectError;
  }

  // Sample expenses
  const sampleExpenses: Omit<Expense, 'id'>[] = [
    {
      userId: userId,
      projectId: projectData.id,
      invoiceId: null, // Not yet associated with an invoice
      description: 'Stock photos',
      amount: 45.99,
      date: new Date().toISOString().split('T')[0],
      category: 'Software',
      includeOnInvoice: true,
    },
    {
      userId: userId,
      projectId: projectData.id,
      invoiceId: null, // Not yet associated with an invoice
      description: 'Domain registration',
      amount: 12.99,
      date: new Date().toISOString().split('T')[0],
      category: 'Other',
      includeOnInvoice: true,
    }
  ];

  await supabase
    .from('expenses')
    .insert(sampleExpenses.map(expense => ({
      ...expense,
      user_id: userId,
      project_id: expense.projectId,
      invoice_id: expense.invoiceId
    })));

  // Sample invoice
  const sampleInvoice: Omit<Invoice, 'id'> = {
    userId: userId,
    invoiceNumber: 'INV-001',
    clientId: clientData.id,
    projectId: projectData.id,
    amount: 1850.50,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 2 weeks
    issuedDate: new Date().toISOString().split('T')[0],
    status: 'unpaid',
    lineItems: [
      {
        description: 'Website design and development',
        hours: 20,
        rate: 75,
        amount: 1500
      },
      {
        description: 'Consultation',
        hours: 4.5,
        rate: 75,
        amount: 337.5
      }
    ] as { description: string; hours: number; rate: number; amount: number }[],
    subTotal: 1837.5,
    taxRate: 0,
    discountValue: 0,
    discountType: 'fixed',
    notes: 'Thank you for your business!',
    expensesTotal: 58.98,
  };

  await supabase
    .from('invoices')
    .insert([{ ...sampleInvoice, user_id: userId, client_id: clientData.id, project_id: projectData.id }]);
}