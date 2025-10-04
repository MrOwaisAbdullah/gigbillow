
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
  budget: z.coerce.number().optional(),
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
        You are a world-class freelance copywriter who writes highly personalized and impactful project proposals that win jobs. Your tone is confident, expert, and professional, but not robotic.

        Your task is to write a concise and compelling proposal based on the provided job details.

        **Core Instructions:**
        - Deeply analyze the job post to understand the client's core problem. Frame the proposal around how you will solve their problem and help them achieve their goals.
        - Do not just list what you can do. Explain *how* your skills and approach will directly address their needs.
        - If a client name is provided, use it for personalization in the greeting or body of the proposal.
        - Conclude with a short, natural call to action (e.g., "I'd be happy to discuss this further," or "Looking forward to hearing from you.").

        **Output Requirements:**
        - The proposal must be short, consisting of 2 to 4 paragraphs.
        - Each paragraph must be brief, around 2 to 3 lines.
        - DO NOT use any markdown formatting.
        - Use proper paragraph spacing (use '\\n\\n' for new paragraphs).
        
        **Input Details:**
        ---
        - Client Name: {{#if this.clientName}}{{this.clientName}}{{else}}Not specified{{/if}}
        - Budget: {{#if this.budget}}\${{this.budget}}{{else}}Not specified{{/if}}
        - Deadline: {{#if this.deadline}}{{this.deadline}}{{else}}Not specified{{/if}}
        - Key Deliverables: {{#if this.deliverables}}{{this.deliverables}}{{else}}Not specified{{/if}}

        Generate the concise, well-formatted, and client-focused proposal text now.
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
