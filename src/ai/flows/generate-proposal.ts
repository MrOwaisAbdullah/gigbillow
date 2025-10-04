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
  deliverables: z.string(),
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
        You are a professional freelancer with expertise in writing winning project proposals.
        Your task is to write a concise and compelling {mode} proposal (around 150-200 words) based on the provided job details.

        Job Post Description:
        ---
        {jobPostText}
        ---

        Key Information:
        - Client Name: {clientName}
        - Budget: {budget, select, undefined{} other{\${budget}}}
        - Deadline: {deadline}
        - Key Deliverables: {deliverables}

        Tailor the tone and content appropriately for the selected mode ({mode}).
        For 'Marketplace' mode, be direct, concise, and focus on how your skills match the job post.
        For 'Private Client' mode, adopt a slightly more formal and consultative tone, like you would in an email or a formal document.

        Generate the proposal text now.
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
