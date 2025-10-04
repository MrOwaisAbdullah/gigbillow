
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
  mode: z.enum(['Marketplace', 'Private Client']),
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

        Your task is to write a concise and compelling proposal for the following job. The proposal should be short and impactful (around 150 words).

        **Analysis of the Job Post:**
        First, deeply analyze the provided job post to understand the client's core problem and desired outcome. Do not just repeat the job description.

        **Proposal Strategy:**
        - Start with a strong opening that shows you understand the client's real need. Avoid generic greetings like "I read your job post...".
        - Briefly introduce yourself as the right person for the job, connecting your expertise directly to the client's problem.
        - Propose a clear, high-level plan or mention the key deliverables.
        - End with a confident call to action.

        **Personalization:**
        - If a client name is provided, use it.
        - Adapt the tone for the proposal mode:
            - **Marketplace:** More direct and concise. Get straight to the point.
            - **Private Client:** Slightly more formal and consultative.

        **Input Details:**
        - **Mode:** {{mode}}
        - **Job Post:**
        ---
        {{jobPostText}}
        ---
        - **Client Name:** {{#if clientName}}{{clientName}}{{else}}Not specified{{/if}}
        - **Budget:** {{#if budget}}${{budget}}{{else}}Not specified{{/if}}
        - **Deadline:** {{#if deadline}}{{deadline}}{{else}}Not specified{{/if}}
        - **Key Deliverables:** {{#if deliverables}}{{deliverables}}{{else}}Not specified{{/if}}

        Generate the proposal text now based on these instructions. Do not sound like a generic AI.
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
