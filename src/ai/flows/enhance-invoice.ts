'use server';

/**
 * @fileOverview This file defines a Genkit flow for enhancing an invoice with a professional summary.
 *
 * - enhanceInvoice - A function that accepts invoice data and returns a professional summary.
 * - EnhanceInvoiceInput - The input type for the enhanceInvoice function.
 * - EnhanceInvoiceOutput - The output type for the enhanceInvoice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EnhanceInvoiceInputSchema = z.object({
    clientName: z.string().describe('The name of the client being invoiced.'),
    userName: z.string().describe('The name of the freelancer or company sending the invoice.'),
    lineItems: z.array(z.object({ description: z.string() })).describe('An array of line items, each with a description.'),
    totalAmount: z.number().describe('The final total amount for the invoice.'),
    dueDate: z.string().describe('The date the invoice is due, in a readable format.'),
});

export type EnhanceInvoiceInput = z.infer<typeof EnhanceInvoiceInputSchema>;

const EnhanceInvoiceOutputSchema = z.object({
  summary: z.string().describe('A short, professional, and friendly summary or cover letter for the invoice.'),
});

export type EnhanceInvoiceOutput = z.infer<typeof EnhanceInvoiceOutputSchema>;

export async function enhanceInvoice(input: EnhanceInvoiceInput): Promise<EnhanceInvoiceOutput> {
  return enhanceInvoiceFlow(input);
}

const enhanceInvoicePrompt = ai.definePrompt({
  name: 'enhanceInvoicePrompt',
  input: { schema: EnhanceInvoiceInputSchema },
  output: { schema: EnhanceInvoiceOutputSchema },
  prompt: `You are an expert at writing professional and friendly communications for freelancers.
Your task is to generate a short cover letter or summary for an invoice.

The summary should be:
- Addressed to the client, {{clientName}}.
- Signed off by the freelancer, {{userName}}.
- Briefly mention the work that was done, based on these line items:
{{#each lineItems}}
  - {{this.description}}
{{/each}}
- State the total amount due: \${{totalAmount}}.
- Mention the payment due date: {{dueDate}}.
- Maintain a polite, professional, and friendly tone.

Generate the summary now.
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
