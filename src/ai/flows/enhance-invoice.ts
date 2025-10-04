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

Use Tailwind CSS for styling within the HTML. The final output should be a single HTML string.

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

**Instructions:**
1.  Create a full HTML document structure (<html>, <head> with Tailwind CDN link, <body>).
2.  Use a professional and modern design. Use cards, shadows, and a clean layout.
3.  The color scheme should be based on these CSS variables, which will be present: --primary, --secondary, --background, --foreground, --card, --border. Use them like \`bg-background\`, \`text-primary\`, etc.
4.  The main invoice should be in a container with a max-width and centered.
5.  Clearly display the invoice title, number, dates, and "Bill To" / "From" sections.
6.  Present the line items in a table with columns for Description and Amount (for the subtotal).
7.  The footer should clearly show the Sub-total, Tax, and the final Total amount.
8.  If a payment URL is provided, include a prominent "Pay Now" button that links to it. The button should be styled like a primary action button.
9.  If notes are provided, display them in a "Notes" section at the bottom.
10. Ensure the entire output is a single, valid HTML string. Do not wrap it in markdown.

Example Structure:
- Header with your company name and "Invoice" title.
- Section with invoice details (number, dates) and client/your info.
- Main content table for line items.
- Footer section for totals.
- "Pay Now" button and notes at the very bottom.

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
