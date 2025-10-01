'use server';

/**
 * @fileOverview This file defines a Genkit flow for importing work logs from external platforms like Fiverr and Upwork.
 *
 * - importWorkLogs - A function that accepts work log data as input and returns structured information for invoice generation.
 * - ImportWorkLogsInput - The input type for the importWorkLogs function.
 * - ImportWorkLogsOutput - The output type for the importWorkLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImportWorkLogsInputSchema = z.object({
  platformName: z
    .string()
    .describe('The name of the platform the work log is from (e.g., Fiverr, Upwork).'),
  workLogData: z
    .string()
    .describe(
      'The raw work log data as text.  Include all relevant information, including project name, hours worked, and rate.'
    ),
});
export type ImportWorkLogsInput = z.infer<typeof ImportWorkLogsInputSchema>;

const ImportWorkLogsOutputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  hoursWorked: z.number().describe('The number of hours worked.'),
  rate: z.number().describe('The hourly rate for the work.'),
  description: z.string().describe('A description of the work completed.'),
});
export type ImportWorkLogsOutput = z.infer<typeof ImportWorkLogsOutputSchema>;

export async function importWorkLogs(input: ImportWorkLogsInput): Promise<ImportWorkLogsOutput> {
  return importWorkLogsFlow(input);
}

const importWorkLogsPrompt = ai.definePrompt({
  name: 'importWorkLogsPrompt',
  input: {schema: ImportWorkLogsInputSchema},
  output: {schema: ImportWorkLogsOutputSchema},
  prompt: `You are an expert at extracting structured data from freelancer work logs.

  Given the following work log data from {{platformName}}, extract the project name, hours worked, hourly rate, and a description of the work completed.

  Work Log Data:
  {{workLogData}}

  Return the data in JSON format.
  Make sure the hoursWorked and rate fields are numbers.
  Do not include any conversational text in the output.
  `,
});

const importWorkLogsFlow = ai.defineFlow(
  {
    name: 'importWorkLogsFlow',
    inputSchema: ImportWorkLogsInputSchema,
    outputSchema: ImportWorkLogsOutputSchema,
  },
  async input => {
    const {output} = await importWorkLogsPrompt(input);
    return output!;
  }
);



