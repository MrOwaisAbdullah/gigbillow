import { supabase } from '@/lib/supabase';
import { startOfWeek, startOfMonth, subDays, format } from 'date-fns';

export async function getDashboardStats() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }).toISOString(); // Monday start
  const startOfCurrentMonth = startOfMonth(now).toISOString();
  const thirtyDaysAgo = subDays(now, 30).toISOString();

  try {
    // 1. Outstanding Revenue (unpaid + overdue)
    const { data: outstandingInvoices, error: outstandingError } = await supabase
      .from('invoices')
      .select('amount')
      .eq('user_id', user.id)
      .in('status', ['unpaid', 'overdue']);

    if (outstandingError) throw outstandingError;

    const outstandingRevenue = outstandingInvoices?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;

    // 2. Income (Last 30d) - paid invoices
    const { data: paidInvoices, error: incomeError } = await supabase
      .from('invoices')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .gte('issued_date', thirtyDaysAgo);

    if (incomeError) throw incomeError;

    const incomeLast30d = paidInvoices?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;

    // 3. Hours This Week
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('hours')
      .eq('user_id', user.id)
      .gte('start_time', startOfCurrentWeek);

    if (timeError) throw timeError;

    const hoursThisWeek = timeEntries?.reduce((sum, entry) => sum + parseFloat(entry.hours), 0) || 0;

    // 4. Expenses (This Month)
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startOfCurrentMonth);

    if (expensesError) throw expensesError;

    const expensesThisMonth = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;

    return {
      outstandingRevenue,
      incomeLast30d,
      hoursThisWeek,
      expensesThisMonth
    };

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
}
