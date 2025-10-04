'use server';

/**
 * @fileOverview This file defines a Genkit flow for enhancing an invoice with a professional template and summary.
 *
 * - enhanceInvoice - A function that accepts invoice data and returns an HTML-formatted invoice.
 * - EnhanceInvoiceInput - The input type for the enhanceInvoice function.
 * - EnhanceInvoiceOutput - The output type for the enhanceInvoice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnhanceInvoiceInputSchema = z.object({
    invoiceNumber: z.string().describe('The unique identifier for the invoice.'),
    clientName: z.string().describe('The name of the client being invoiced.'),
    clientEmail: z.string().describe('The email of the client.'),
    userName: z.string().describe('The name of the freelancer or company sending the invoice.'),
    userEmail: z.string().describe('The email of the freelancer or company.'),
    issuedDate: z.string().describe('The date the invoice was issued, in a readable format (e.g., "July 26, 2024").'),
    dueDate: z.string().describe('The date the invoice is due, in a readable format.'),
    lineItems: z.array(z.object({ description: z.string() })).describe('An array of line items, each with a description.'),
    subTotal: z.number().describe('The sub-total amount before taxes.'),
    taxRate: z.number().describe('The tax rate in percentage (e.g., 10 for 10%).'),
    taxAmount: z.number().describe('The calculated tax amount.'),
    totalAmount: z.number().describe('The final total amount for the invoice.'),
    notes: z.string().optional().describe('Any additional notes for the client.'),
    paymentUrl: z.string().optional().describe('A URL for online payment, if available.'),
});

export type EnhanceInvoiceInput = z.infer<typeof EnhanceInvoiceInputSchema>;

const EnhanceInvoiceOutputSchema = z.object({
  html: z.string().describe('The full HTML content of the professionally formatted invoice.'),
});

export type EnhanceInvoiceOutput = z.infer<typeof EnhanceInvoiceOutputSchema>;

export async function enhanceInvoice(input: EnhanceInvoiceInput): Promise<EnhanceInvoiceOutput> {
  return enhanceInvoiceFlow(input);
}

const enhanceInvoicePrompt = ai.definePrompt({
  name: 'enhanceInvoicePrompt',
  input: { schema: EnhanceInvoiceInputSchema },
  output: { schema: EnhanceInvoiceOutputSchema },
  prompt: `You are an expert invoice designer. Your task is to generate a professional, clean, and modern HTML invoice based on the data provided.

Use Tailwind CSS for styling within the HTML. The final output must be a single, complete HTML string.

**Invoice Data:**
- Invoice Number: {{invoiceNumber}}
- Client: {{clientName}} ({{clientEmail}})
- From: {{userName}} ({{userEmail}})
- Issued: {{issuedDate}}
- Due: {{dueDate}}
- Sub-total: \${{subTotal}}
- Tax ({{taxRate}}%): \${{taxAmount}}
- Total: \${{totalAmount}}
{{#if notes}}
- Notes: {{notes}}
{{/if}}
{{#if paymentUrl}}
- Payment Link: {{paymentUrl}}
{{/if}}
- Line Items:
{{#each lineItems}}
  - {{this.description}}
{{/each}}

**Design & Styling Instructions:**
1.  **Document Structure:** Create a full HTML5 document ('<!DOCTYPE html><html>...</html>').
2.  **Tailwind CSS:** Include the Tailwind CSS CDN script in the '<head>': '<script src="https://cdn.tailwindcss.com"></script>'.
3.  **Layout:** The main content should be within a '<body>' tag with a light gray background ('bg-gray-100'). The invoice itself should be a white card ('bg-white') centered on the page, with padding, rounded corners, and a subtle shadow. Use a standard A4 paper aspect ratio by setting 'max-w-4xl mx-auto p-8'.
4.  **Header:** Create a header section. On the left, display "{{userName}}". On the right, display "INVOICE" in a larger, bold font.
5.  **Details Section:** Below the header, create a section with two columns.
    *   **Left Column (Bill To):** Display "BILL TO", followed by the client's name and email.
    *   **Right Column (Invoice Details):** Display the Invoice Number, Issue Date, and Due Date. Align text to the right in this column.
6.  **Line Items Table:**
    *   Create a table with a header row containing "Description".
    *   The table header should have a light gray background.
    *   Iterate through the 'lineItems' to create table rows. Each line item should be in its own row under the "Description" column.
7.  **Totals Section:**
    *   Below the table, create a right-aligned section to display the Sub-total, Tax, and the final Total.
    *   Clearly label "Sub-total", "Tax ({{taxRate}}%)", and "Total".
    *   The "Total" amount should be in a larger, bold font to make it stand out.
8.  **Footer:**
    *   If 'notes' are provided, add a "Notes" section at the bottom.
    *   If a 'paymentUrl' is provided, include a prominent, styled "Pay Now" button that links to it. The button should have a primary brand color, padding, and rounded corners.
9.  **Typography & Spacing:** Use professional fonts (e.g., sans-serif). Use padding and margins generously to create a clean, readable layout. Use 'text-gray-500' for labels and secondary text, and 'text-gray-900' for primary content.
10. **Final Output:** Ensure the entire output is a single, valid HTML string. Do not wrap it in markdown.

Begin generating the HTML now.
`,
});

const enhanceInvoiceFlow = ai.defineFlow(
  {
    name: 'enhanceInvoiceFlow',
    inputSchema: EnhanceInvoiceInputSchema,
    outputSchema: EnhanceInvoiceOutputSchema,
  },
  async input => {
    const { output } = await enhanceInvoicePrompt(input);
    return output!;
  }
);
