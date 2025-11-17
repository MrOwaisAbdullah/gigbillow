# Firebase to Supabase Migration Guide

This document outlines the steps required to migrate your existing Firebase-based SaaS application to Supabase.

## Overview

This migration involves converting from a Firebase/Firestore NoSQL database to a Supabase/PostgreSQL SQL database. The main changes include:
- Converting nested Firestore collections to flat SQL tables with foreign keys
- Replacing Firebase Authentication with Supabase Authentication
- Updating all API functions to use Supabase client instead of Firebase
- Implementing Row Level Security (RLS) policies for data access control

## Prerequisites

1. Create a new Supabase project at https://supabase.com/
2. Install the Supabase CLI: `npm install -g supabase`
3. Install required Node.js dependencies: `npm install @supabase/supabase-js`

## Step 1: Set up Supabase Database Schema

1. Copy and execute the SQL commands from `schema.sql` in your Supabase SQL editor
2. This will create all necessary tables and RLS policies

## Step 2: Environment Configuration

Update your environment variables:

### Remove Firebase Variables
Remove or comment out these Firebase variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- etc.

### Add Supabase Variables
Add these Supabase variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Replace Firebase with Supabase Client

1. Replace `src/lib/firebase.ts` with Supabase configuration
2. Update all import statements from Firebase to Supabase
3. Convert Firestore queries to Supabase queries

## Step 4: Update Authentication System

1. Replace Firebase Auth with Supabase Auth
2. Update user registration and login functions
3. Update user initialization logic

## Step 5: Update API Functions

Replace all Firebase API functions in `src/lib/api/` with Supabase equivalents:

- `clients.ts` - Convert Firestore queries to Supabase queries
- `invoices.ts` - Convert Firestore queries to Supabase queries
- `projects.ts` - Convert Firestore queries to Supabase queries
- `time-entries.ts` - Convert Firestore queries to Supabase queries
- `expenses.ts` - Convert Firestore queries to Supabase queries
- `referrals.ts` - Convert Firestore queries to Supabase queries
- `tokens.ts` - Convert Firestore queries to Supabase queries
- `users.ts` - Convert Firestore queries to Supabase queries
- `feedback.ts` - Convert Firestore queries to Supabase queries

## Step 6: Update Components

1. Update `AuthProvider` to use Supabase auth state
2. Update `TokenProvider` to use Supabase real-time subscriptions
3. Update all UI components that make database calls

## Step 7: Update Data Types

Update the TypeScript types in `src/lib/types.ts` to match the new SQL schema structure, particularly:
- Foreign key relationships (user_id, project_id, etc.)
- Date formats (PostgreSQL timestamps vs Firestore timestamps)
- JSON fields (line_items in invoices table)

## Step 8: Testing

1. Test user registration and login
2. Test all CRUD operations for each entity
3. Test token system functionality
4. Test real-time updates
5. Verify RLS policies are working correctly

## Important Notes

1. **Data Migration**: You'll need to write custom scripts to migrate existing data from Firebase to Supabase
2. **Timestamps**: Firebase uses Firestore Timestamps while PostgreSQL uses standard datetime fields
3. **Nested Data**: Firestore allowed nested objects, but PostgreSQL uses foreign keys for relationships
4. **Real-time Subscriptions**: Replace Firestore real-time listeners with Supabase real-time subscriptions
5. **Security Rules**: Firebase security rules are replaced with PostgreSQL RLS policies

## Common Conversion Patterns

### Firestore Query to Supabase Query
```javascript
// Firebase
const querySnapshot = await getDocs(collection(db, `users/${userId}/clients`));

// Supabase
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', userId);
```

### Firestore Real-time Listener to Supabase
```javascript
// Firebase
const unsubscribe = onSnapshot(collection(db, `users/${userId}/clients`), (snapshot) => {
  // handle updates
});

// Supabase
const subscription = supabase
  .channel('clients-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'clients',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // handle updates
  })
  .subscribe();
```

### Firebase Auth State Listener to Supabase
```javascript
// Firebase
const unsubscribe = onAuthStateChanged(auth, (user) => {
  // handle auth state
});

// Supabase
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  // handle auth state
});
```

## Token Provider Update

The token provider currently uses Firestore real-time updates. This needs to be updated to use Supabase real-time functionality:

```javascript
// Subscribe to changes in user tokens
const subscription = supabase
  .channel('user-tokens')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'user_tokens',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    setTokenData(payload.new);
  })
  .subscribe();
```

## Post-Migration Cleanup

After successful migration:
1. Remove Firebase dependencies from `package.json`
2. Remove Firebase configuration files
3. Remove Firebase-specific code
4. Update documentation to reflect Supabase usage

This migration will provide better performance, more powerful querying capabilities, and easier data aggregation features compared to Firestore.