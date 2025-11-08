# OwFlex Implemented Features

This document provides a clear overview of the features that are currently implemented and functional within the OwFlex application.

---

## ✅ Core Features

### 1. Authentication & Onboarding
- **Status:** Fully Implemented
- **Details:**
    - **Sign-up & Login:** Users can create accounts and log in using Google or Email/Password.
    - **User Initialization:** A new user profile and token record are automatically created in Firestore upon first sign-up.
    - **Profile Sync:** User information (name, photo) is kept in sync with the auth provider.
    - **Welcome Tour:** A multi-step welcome tour introduces new users to the app's key features.
    - **Referral Code Handling:** The system saves referral codes from sign-up links to local storage.

### 2. AI Proposal Generator
- **Status:** Fully Implemented
- **Details:**
    - **AI Generation:** Uses Genkit to generate a professional project proposal from a job description and other optional inputs. Costs 1 token.
    - **PDF Download:** Users can download the generated proposal as a branded or unbranded PDF. Costs extra tokens to remove the watermark.
    - **State Persistence:** Form data is saved to local storage, so users don't lose their input if they navigate away.

### 3. Time Tracking
- **Status:** Fully Implemented
- **Details:**
    - **Digital Stopwatch:** A simple start/pause/stop interface for tracking time against a selected project.
    - **State Persistence:** The timer's state (project, elapsed time) is saved to `localStorage`, making it resilient to page reloads.
    - **Automatic Saving:** When stopped, the time entry is automatically saved to Firestore.
    - **Time Log History:** A "History" sheet shows a paginated log of all past time entries.

### 4. Client & Project Management
- **Status:** Partially Implemented
- **Details:**
    - **Create & View:** Users can create, view, and delete clients and projects.
    - **Project-Client Linking:** Projects are correctly linked to clients.
    - **Token Cost:** Creating a new project costs 1 token.

### 5. Expense Tracking
- **Status:** Partially Implemented
- **Details:**
    - **Create & View:** Users can log, view, and delete expenses. Expenses can be assigned to projects.
    - **Invoice Integration:** Uninvoiced expenses for a project are automatically suggested during invoice creation.

### 6. Invoicing
- **Status:** Mostly Implemented
- **Details:**
    - **Multi-step Creation Form:** A guided form for creating new invoices.
    - **Auto-fill from Time:** Can automatically calculate and populate a line item based on tracked hours for a project.
    - **AI Summary:** Uses Genkit to generate a professional, friendly summary for the invoice body. Costs 1 token.
    - **Expense Integration:** Seamlessly adds selected uninvoiced expenses to the invoice total.
    - **PDF Generation:** Generates a professional, branded PDF of the invoice. Costs 1 token (plus 3 to remove the watermark).
    - **Public Share Link:** Generates a unique, shareable URL for clients to view the invoice online.

### 7. Reporting Dashboard
- **Status:** Fully Implemented
- **Details:**
    - **KPI Display:** The dashboard shows key metrics like Outstanding Revenue, Recent Income, Hours Tracked, and Expenses.
    - **Visual Charts:** Includes charts for monthly revenue and hours per project.
    - **PDF/CSV Export:** Users can export a consolidated report as a PDF or CSV file. Costs 1 token.

### 8. Monetization (Token System)
- **Status:** Mostly Implemented (Simulation)
- **Details:**
    - **Token Tracking:** User token balances are tracked in Firestore.
    - **Token Spending:** Premium actions (proposals, PDF downloads, project creation, etc.) correctly deduct tokens from the user's balance.
    - **Free Tokens:** A system grants new users free tokens and refills them monthly based on their subscription status.
    - **Simulated Purchases:** A dialog allows users to "buy" token packs, which simulates a payment flow and adds tokens to their account.
    - **Missing:** **Real payment processing.** There is no integration with a payment provider like Stripe. The purchasing flow is a simulation.

### 9. Referral Program
- **Status:** Partially Implemented
- **Details:**
    - **Referral Code Generation:** Each user is assigned a unique referral code.
    - **Frontend UI:** A dashboard exists for users to view their code and track referral progress.
    - **Missing:** The backend logic to confirm a successful referral (i.e., when a referred user pays) and issue rewards is not implemented.

---

## ❌ Features Mentioned in Docs but NOT Implemented

- **Editing Functionality:** The ability to edit existing clients, projects, or expenses. The UI buttons exist but are placeholders for editing functionality.
- **Real Stripe Integration:** The entire payment and subscription flow is simulated. There are no webhooks or connections to a real Stripe account.
- **Password Reset:** The "Update Password" feature in Settings is a placeholder.
- **Account Deletion:** The "Delete My Account" feature is a placeholder.
- **Dark Mode:** While the CSS variables for a dark theme exist, a theme toggler has not been implemented.
- **Logo Upload/Storage:** There is no functionality for a user to upload or store a logo file. The system only supports embedding a logo from a public URL.