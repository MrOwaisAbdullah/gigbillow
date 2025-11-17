import { supabase } from '@/lib/supabase';
import type { TimeEntry } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export async function getTimeEntriesByProject(projectId: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', projectId);

  if (error) {
    console.error("Error fetching time entries by project:", error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    startTime: row.start_time,
    endTime: row.end_time,
    description: row.description,
    hours: parseFloat(row.hours),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getTimeEntries(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: string | null = null,
    pageSize: number = 10
): Promise<{ timeEntries: TimeEntry[], nextCursor: string | null, hasNextPage: boolean }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { timeEntries: [], nextCursor: null, hasNextPage: false };
    }

    let query = supabase
      .from('time_entries')
      .select(`
        id,
        user_id,
        project_id,
        start_time,
        end_time,
        description,
        hours,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: false }); // Most recent first

    if (cursor) {
      query = query.gt('id', cursor);
    }

    const { data, error } = await query
      .limit(pageSize + 1); // Fetch one extra to check for next page

    if (error) {
      console.error("Error fetching time entries:", error);
      return { timeEntries: [], nextCursor: null, hasNextPage: false };
    }

    const hasNextPage = data.length > pageSize;
    const timeEntries = data.slice(0, pageSize).map(row => ({
      id: row.id,
      userId: row.user_id,
      projectId: row.project_id,
      startTime: row.start_time,
      endTime: row.end_time,
      description: row.description,
      hours: parseFloat(row.hours),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) as TimeEntry[];

    const nextCursor = hasNextPage ? data[data.length - 2]?.id : null;

    return {
      timeEntries,
      nextCursor,
      hasNextPage,
    };
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return { timeEntries: [], nextCursor: null, hasNextPage: false };
  }
}

export async function createTimeEntry(timeEntry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a time entry.' });
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert([{
      user_id: user.id,
      project_id: timeEntry.projectId,
      start_time: timeEntry.startTime,
      end_time: timeEntry.endTime,
      description: timeEntry.description,
      hours: timeEntry.hours
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating time entry:", error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    projectId: data.project_id,
    startTime: data.start_time,
    endTime: data.end_time,
    description: data.description,
    hours: parseFloat(data.hours),
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function getTodaysTimeEntries(
    page?: 'first' | 'next' | 'prev',
    cursor?: string | null,
    pageSize?: number
): Promise<TimeEntry[] | { entries: TimeEntry[], next: string | null }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // If no user, return appropriate format based on whether pagination params were provided
    if (page === undefined) {
      return []; // Return array format when called without pagination (TodaysPulse)
    } else {
      return { entries: [], next: null }; // Return object format when called with pagination (TodaysLog)
    }
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // If called without parameters (backward compatibility for TodaysPulse), return all entries as array
  if (page === undefined) {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        id,
        user_id,
        project_id,
        start_time,
        end_time,
        description,
        hours,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .gte('start_time', `${todayString}T00:00:00`)
      .lte('start_time', `${todayString}T23:59:59`)
      .order('start_time', { ascending: false });

    if (error) {
      console.error("Error fetching today's time entries:", error);
      return [];
    }

    return data.map(row => ({
      id: row.id,
      userId: row.user_id,
      projectId: row.project_id,
      startTime: row.start_time,
      endTime: row.end_time,
      description: row.description,
      hours: parseFloat(row.hours),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  // If called with pagination parameters (new functionality for TodaysLog), return results with pagination
  let query = supabase
    .from('time_entries')
    .select(`
      id,
      user_id,
      project_id,
      start_time,
      end_time,
      description,
      hours,
      created_at,
      updated_at
    `)
    .eq('user_id', user.id)
    .gte('start_time', `${todayString}T00:00:00`)
    .lte('start_time', `${todayString}T23:59:59`)
    .order('start_time', { ascending: false }); // Most recent first

  if (cursor) {
    query = query.gt('id', cursor);
  }

  const { data, error } = await query
    .limit((pageSize || 10) + 1); // Fetch one extra to check for next page

  if (error) {
    console.error("Error fetching today's time entries:", error);
    return { entries: [], next: null };
  }

  const hasNextPage = data.length > (pageSize || 10);
  const entries = data.slice(0, pageSize || 10).map(row => ({
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    startTime: row.start_time,
    endTime: row.end_time,
    description: row.description,
    hours: parseFloat(row.hours),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  const next = hasNextPage ? data[data.length - 2]?.id : null;

  return { entries, next };
}

export async function updateTimeEntry(id: string, timeEntry: Partial<Omit<TimeEntry, 'id'>>): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update a time entry.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('time_entries')
    .update({
      project_id: timeEntry.projectId,
      start_time: timeEntry.startTime,
      end_time: timeEntry.endTime,
      description: timeEntry.description,
      hours: timeEntry.hours
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error updating time entry:", error);
    throw error;
  }
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete a time entry.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error deleting time entry:", error);
    throw error;
  }
}

export async function getTimeEntryById(id: string): Promise<TimeEntry | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error("Error fetching time entry by id:", error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      projectId: data.project_id,
      startTime: data.start_time,
      endTime: data.end_time,
      description: data.description,
      hours: parseFloat(data.hours),
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error fetching time entry by id:", error);
    return null;
  }
}