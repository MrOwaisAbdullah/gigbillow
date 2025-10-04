
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a project proposal.
 *
 * - generateProposal - A function that accepts proposal details and returns a generated proposal.
 * - GenerateProposalInput - The input type for the generateProposal function.
 * - GenerateProposalOutput - The output type for the generateProposal function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateProposalInputSchema = z.object({
  jobPostText: z.string().max(2000),
  clientName: z.string().optional(),
  budget: z.number().optional(),
  deadline: z.string().optional(),
  deliverables: z.string().optional(),
});

export type GenerateProposalInput = z.infer<typeof GenerateProposalInputSchema>;

const GenerateProposalOutputSchema = z.object({
  proposal: z.string().describe('The generated proposal text.'),
});

export type GenerateProposalOutput = z.infer<typeof GenerateProposalOutputSchema>;


export async function generateProposal(input: GenerateProposalInput): Promise<GenerateProposalOutput> {
    return generateProposalFlow(input);
}


const generateProposalPrompt = ai.definePrompt({
    name: 'generateProposalPrompt',
    input: { schema: GenerateProposalInputSchema },
    output: { schema: GenerateProposalOutputSchema },
    prompt: `
        You are a world-class freelance copywriter who specializes in writing highly personalized and impactful project proposals that win jobs. Your tone is confident, expert, and professional, but not robotic.

        Your task is to write a concise and compelling proposal for the following job.

        **Output Structure:**
        The output must be well-formatted, professional, and easy to read. Use clear headings, bullet points for lists, and proper paragraph spacing (use '\\n\\n' for new paragraphs). The structure should be:
        1.  **Subject Line:** A compelling subject line for an email.
        2.  **Opening:** A strong opening that shows you understand the client's real need. Avoid generic greetings.
        3.  **Introduction/Body:** Briefly introduce yourself, connect your expertise to the client's problem, and outline a clear, high-level plan or mention the key deliverables.
        4.  **Closing:** A confident call to action to discuss the project further.

        **Analysis of the Job Post:**
        Deeply analyze the provided job post to understand the client's core problem and desired outcome. Do not just repeat the job description.

        **Personalization:**
        - If a client name is provided, use it.

        **Input Details:**
        - **Job Post:**
        ---
        {{this.jobPostText}}
        ---
        - **Client Name:** {{#if this.clientName}}{{this.clientName}}{{else}}Not specified{{/if}}
        - **Budget:** {{#if this.budget}}${{this.budget}}{{else}}Not specified{{/if}}
        - **Deadline:** {{#if this.deadline}}{{this.deadline}}{{else}}Not specified{{/if}}
        - **Key Deliverables:** {{#if this.deliverables}}{{this.deliverables}}{{else}}Not specified{{/if}}

        Generate the structured and well-formatted proposal text now based on these instructions. Do not sound like a generic AI.
    `
});

const generateProposalFlow = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: GenerateProposalOutputSchema,
  },
  async input => {
    const { output } = await generateProposalPrompt(input);
    return output!;
  }
);
