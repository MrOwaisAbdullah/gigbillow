'use client';

import { supabase } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { SupabasePermissionError } from '@/lib/errors';

export async function getProjects(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: string | null = null,
    pageSize: number = 10
): Promise<{ projects: Project[], nextCursor: string | null, hasNextPage: boolean }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { projects: [], nextCursor: null, hasNextPage: false };
    }

    let query = supabase
      .from('projects')
      .select(`
        id,
        user_id,
        name,
        client_id,
        status,
        rate,
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
      const permissionError = new SupabasePermissionError({
        path: 'projects',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    }

    const hasNextPage = data.length > pageSize;
    const projects = data.slice(0, pageSize).map(row => ({
      id: row.id,
      userId: row.user_id,
      clientId: row.client_id,
      name: row.name,
      status: row.status,
      rate: row.rate,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) as Project[];
    
    const nextCursor = hasNextPage ? data[data.length - 2]?.id : null;

    return {
      projects,
      nextCursor,
      hasNextPage
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { projects: [], nextCursor: null, hasNextPage: false };
  }
}

export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        user_id,
        name,
        client_id,
        status,
        rate,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }); // Show newest first

    if (error) {
      return [];
    }

    return data.map(row => ({
      id: row.id,
      userId: row.user_id,
      clientId: row.client_id,
      name: row.name,
      status: row.status,
      rate: row.rate,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    return [];
  }
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a project.' });
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      user_id: user.id,
      client_id: project.clientId,
      name: project.name,
      status: project.status,
      rate: project.rate
    }])
    .select()
    .single();

  if (error) {
    const permissionError = new SupabasePermissionError({
      path: 'projects',
      operation: 'create',
      requestResourceData: project,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }

  return {
    id: data.id,
    userId: data.user_id,
    clientId: data.client_id,
    name: data.name,
    status: data.status,
    rate: data.rate,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateProject(id: string, project: Partial<Omit<Project, 'id'>>): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update a project.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('projects')
    .update({
      name: project.name,
      client_id: project.clientId,
      status: project.status,
      rate: project.rate
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    const permissionError = new SupabasePermissionError({
      path: `projects/${id}`,
      operation: 'update',
      requestResourceData: project,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete a project.' });
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    const permissionError = new SupabasePermissionError({
      path: `projects/${id}`,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      const permissionError = new SupabasePermissionError({
        path: `projects/${id}`,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    }

    return {
      id: data.id,
      userId: data.user_id,
      clientId: data.client_id,
      name: data.name,
      status: data.status,
      rate: data.rate,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error fetching project by id:", error);
    return null;
  }
}