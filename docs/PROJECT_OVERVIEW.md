
# OwFlex: Project Overview & Documentation

## 1. The Idea: What is OwFlex?

**OwFlex** is an all-in-one toolkit designed to streamline the administrative side of freelancing. The core idea is to consolidate the essential but time-consuming tasks of running a freelance business into a single, intelligent, and easy-to-use application.

### The Problem It Solves

Freelancers often struggle with:
- **Tool Sprawl:** Using separate apps for time tracking, invoicing, proposals, and project management.
- **Lost Revenue:** Forgetting to track billable hours or failing to include all expenses on an invoice.
- **Unprofessionalism:** Sending plain, unbranded invoices or struggling to write compelling proposals.
- **Lack of Insight:** Having no clear overview of their business performance, revenue trends, or project profitability.

### The Solution We've Built

OwFlex tackles these problems by offering a unified platform with the following core pillars:
- **Track Everything:** Accurately log time and expenses.
- **Get Hired:** Create professional, AI-assisted proposals quickly.
- **Get Paid:** Generate polished PDF invoices and manage their status.
- **Stay Organized:** Manage clients, projects, and business performance from one central dashboard.

---

## 2. Core Features & Functionality

We have successfully implemented a rich set of features that form the foundation of the OwFlex application.

#### a. Authentication & Onboarding
- **Implementation:** Uses Firebase Authentication with support for Google Sign-In and traditional Email/Password.
- **User Initialization:** A robust `initializeUser` function in `src/lib/auth.ts` creates a user profile and token record in Firestore upon first sign-up. It also handles backfilling data for returning users.
- **Welcome Tour:** New users are greeted with a comprehensive welcome tour (`src/components/welcome-tour.tsx`) that explains all major features and provides direct links to each page.

#### b. AI-Powered Proposal Generator
- **Implementation:** Leverages Genkit and Google's Gemini models via the `generateProposal` flow in `src/ai/flows/generate-proposal.ts`.
- **Functionality:** Users can input a job description, and the AI generates a professional, concise, and client-focused proposal. It costs 1 token per generation and supports downloading a branded or unbranded PDF.

#### c. Time Tracking
- **Implementation:** A digital stopwatch interface in `src/app/(app)/track/page.tsx`.
- **Functionality:** The tracker's state (current project, elapsed time) is saved to `localStorage`, making it resilient to page reloads. Once stopped, time entries are saved to the `users/{userId}/timeEntries` Firestore collection. It also shows a log of today's entries.

#### d. Client & Project Management
- **Implementation:** Simple CRUD (Create, Read, Update, Delete) interfaces for clients (`/clients`) and projects (`/projects`).
- **Functionality:** Projects are linked to clients, and each project can have an hourly rate, which is used for automatic calculations in time tracking and invoicing. Creating a new project costs 1 token.

#### e. Expense Tracking
- **Implementation:** A dedicated page at `/expenses` allows users to log and categorize expenses.
- **Functionality:** Expenses can be optionally linked to projects. When creating an invoice, any uninvoiced expenses for the selected project are automatically presented and can be added to the invoice with a single click.

#### f. Invoicing
- **Implementation:** A multi-step form at `/invoices/new` guides the user through invoice creation.
- **Functionality:**
    - **Auto-fill:** Can auto-populate line items from logged time entries for a project.
    - **AI Summary:** Uses Genkit (`enhanceInvoice` flow) to write a professional and friendly summary for the invoice body.
    - **Expense Integration:** Seamlessly adds selected uninvoiced expenses to the total.
    - **PDF Generation:** Generates a professional, branded PDF of the invoice (`src/lib/pdf-utils.ts`), which costs 1 token. Users can pay extra to remove the OwFlex watermark.
    - **Public Share Link:** Generates a shareable public URL for clients to view the invoice (`/share/invoice/[id]`).

#### g. Reporting Dashboard
- **Implementation:** A visual dashboard at `/reports`.
- **Functionality:** Displays key KPIs (Outstanding Revenue, Income, Hours, Expenses) and charts for monthly revenue and hours per project. Reports can be exported as a consolidated PDF or CSV file for 1 token.

#### h. Referral Program
- **Implementation:** A user-facing dashboard at `/referrals`.
- **Functionality:** Each user is assigned a unique referral code. The system is designed to track sign-ups and reward the referrer with discounts when their referrals become paying customers. The front-end UI for tracking progress is complete.

---

## 3. Monetization: The Token System

The app's economy is built on a "token" system, which is managed in `src/lib/api/tokens.ts`.

- **How it Works:** Users spend tokens to perform premium actions.
- **Token Costs:**
    - AI Proposal Generation: 1 token
    - PDF Invoice Download: 1 token
    - Creating a New Project: 1 token
    - AI Work Log Import: 1 token
    - Report Export (PDF/CSV): 1 token
    - Remove PDF Watermark: 3 tokens
- **Earning Tokens & Refills:**
    - **Free Plan:** All users receive 10 free tokens every 30 days. These tokens **do not roll over**.
    - **Subscribed Plan:** After purchasing any token pack, a user is considered "subscribed". Subscribed users receive **150 tokens** every 30 days. They can also **roll over up to 150 unused tokens** from the previous month.
- **Token Pack Validity (UI vs. Backend):**
    - The landing page mentions validity periods (e.g., 1 month, 3 months) for purchased packs. This is currently part of the UI/marketing and is **not programmatically enforced** in the `checkAndRefillTokens` logic. The current backend logic operates on a simpler 30-day refill cycle for all users.

---

## 4. What's Missing & Future Roadmap

While the application is highly functional, several key pieces are either simulated or need to be built out to make it a production-ready SaaS product.

#### a. Stripe Integration (Critical Missing Piece)
- **Problem:** The current "Buy Tokens" and subscription flow is a simulation. There is no real payment processing.
- **Solution Needed:**
    1. **Stripe Webhooks:** Set up a secure backend endpoint (e.g., using Firebase Cloud Functions) to listen for Stripe events like `checkout.session.completed` and `invoice.payment_succeeded`.
    2. **User Linking:** Securely link a user's `userId` in Firebase to their `customer_id` in Stripe.
    3. **Provisioning Tokens/Plans:** The webhook should update a user's plan and add tokens in Firestore after a successful payment.
    4. **Customer Portal:** Integrate the Stripe Customer Portal to allow users to manage their subscriptions, update payment methods, and view billing history. The "Manage Subscription" button in Settings is currently a placeholder.

#### b. Referral Program Backend Logic
- **Problem:** The system currently tracks a referral code on the client-side but has no backend mechanism to confirm the referral and issue rewards.
- **Solution Needed:**
    1. **Webhook Trigger:** When the Stripe webhook confirms a new user has made their first payment, it should check if that user was referred.
    2. **Attribute Reward:** The webhook needs to credit the *referrer* with the appropriate reward (e.g., create a discount coupon in Stripe and link it to the referrer's customer account).

#### c. Backend Security & Validation
- **Problem:** Most of the business logic (like token spending) is currently handled on the client. This is insecure and can be bypassed.
- **Solution Needed:**
    - Move critical logic to a secure backend (Firebase Cloud Functions). For example, a function like `chargeForAction(action, userId)` would validate and decrement tokens on the server, not the client.

#### d. General Enhancements
- **Editing Functionality:** Most "Edit" actions (e.g., for projects, clients) are placeholders and need to be implemented.
- **Password Reset:** The "Update Password" feature is not implemented.
- **Data Deletion:** The "Delete My Account" feature is a placeholder. This would require a backend function to delete all associated user data from Firestore and Firebase Auth, as well as cancel their Stripe subscription.
- **Dark Mode:** While the CSS variables for a dark theme exist in `globals.css`, a theme toggler has not been implemented.
- **Real-time Updates:** Some tables could be converted to use real-time listeners (`onSnapshot`) for a more dynamic feel, though this would increase Firestore read costs.
- **"Early Access" Feature:** The landing page mentions "Early access to new beta features" for the Agency Pack. This is a marketing placeholder and there is currently no backend logic to enable or disable features based on this status.
