'use client';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const { path, operation } = context;
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify({ operation, path }, null, 2)}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}

export class SupabasePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const { path, operation } = context;
    const message = `SupabaseError: Missing or insufficient permissions: The following request was denied by Row Level Security policies:\n${JSON.stringify({ operation, path }, null, 2)}`;
    super(message);
    this.name = 'SupabasePermissionError';
    this.context = context;
    Object.setPrototypeOf(this, SupabasePermissionError.prototype);
  }
}
