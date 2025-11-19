import { supabase } from '@/lib/supabase';
import type { Client } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export async function getClients(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: string | null = null,
    pageSize: number = 10
): Promise<{ clients: Client[], nextCursor: string | null, hasNextPage: boolean }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { clients: [], nextCursor: null, hasNextPage: false };
    }

    let query = supabase
      .from('clients')
      .select(`
        id,
        user_id,
        name,
        email,
        avatar_url,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (cursor) {
      query = query.gt('id', cursor);
    }

    const { data, error } = await query
      .limit(pageSize + 1); // Fetch one extra to check for next page

    if (error) {
      console.error("Error fetching clients:", error);
      return { clients: [], nextCursor: null, hasNextPage: false };
    }

    const hasNextPage = data.length > pageSize;
    const clients = data.slice(0, pageSize).map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      email: row.email,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) as Client[];

    const nextCursor = hasNextPage ? data[data.length - 2]?.id : null;

    return {
      clients,
      nextCursor,
      hasNextPage,
    };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { clients: [], nextCursor: null, hasNextPage: false };
  }
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a client.' });
    throw new Error('User not authenticated');
  }

  console.log('Attempting to create client:', client);
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      user_id: user.id,
      name: client.name,
      email: client.email,
      avatar_url: client.avatarUrl
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating client:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
  console.log('Client created successfully:', data);

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    email: data.email,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id'>>): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update a client.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('clients')
    .update({
      name: client.name,
      email: client.email,
      avatar_url: client.avatarUrl
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error updating client:", error);
    throw error;
  }
}

export async function deleteClient(id: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete a client.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error("Error fetching client by id:", error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error fetching client by id:", error);
    return null;
  }
}