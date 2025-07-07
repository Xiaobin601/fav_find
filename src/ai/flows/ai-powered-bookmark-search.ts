// src/ai/flows/ai-powered-bookmark-search.ts
'use server';

/**
 * @fileOverview AI-powered bookmark search flow.
 *
 * - aiPoweredBookmarkSearch - A function that searches bookmarks using natural language queries.
 * - AiPoweredBookmarkSearchInput - The input type for the aiPoweredBookmarkSearch function.
 * - AiPoweredBookmarkSearchOutput - The return type for the aiPoweredBookmarkSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredBookmarkSearchInputSchema = z.object({
  query: z.string().describe('The natural language search query.'),
  bookmarks: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
    })
  ).describe('The user bookmarks data.'),
});
export type AiPoweredBookmarkSearchInput = z.infer<typeof AiPoweredBookmarkSearchInputSchema>;

const AiPoweredBookmarkSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      relevanceScore: z.number().optional(),
    })
  ).describe('The relevant bookmark links, ranked by relevance.'),
  summary: z.string().optional().describe('A contextual summary of the relevant content.'),
  noResultsMessage: z.string().optional().describe('A message to the user if no bookmarks matched the query.')
});
export type AiPoweredBookmarkSearchOutput = z.infer<typeof AiPoweredBookmarkSearchOutputSchema>;

export async function aiPoweredBookmarkSearch(input: AiPoweredBookmarkSearchInput): Promise<AiPoweredBookmarkSearchOutput> {
  return aiPoweredBookmarkSearchFlow(input);
}

const aiPoweredBookmarkSearchPrompt = ai.definePrompt({
  name: 'aiPoweredBookmarkSearchPrompt',
  input: {schema: AiPoweredBookmarkSearchInputSchema},
  output: {schema: AiPoweredBookmarkSearchOutputSchema},
  prompt: `You are an AI assistant designed to search a user's bookmarks and provide relevant results based on their natural language query.

  The user has provided the following search query:
  {{query}}

  Here are the user's bookmarks:
  {{#each bookmarks}}
  - Title: {{this.title}}
    URL: {{this.url}}
    Description: {{this.description}}
  {{/each}}

  Based on the query and the available bookmarks, identify the most relevant bookmarks. Return the results in the following JSON format:
  {
    "results": [
      {
        "title": "Bookmark Title",
        "url": "Bookmark URL",
        "description": "Bookmark Description (if available)",
        "relevanceScore": 0.85 // A score between 0 and 1 indicating the relevance of the bookmark to the query.
      },
      // ... more results
    ],
    "summary": "A brief summary of the content found in the relevant bookmarks. Only provide a summary if it significantly enhances the user's understanding of the results.",
    "noResultsMessage": "A message to the user if no bookmarks matched the query.  Only return this field if there were no relevant bookmarks found."
  }
  If there are no relevant bookmarks, include a noResultsMessage.
  `,
});

const aiPoweredBookmarkSearchFlow = ai.defineFlow(
  {
    name: 'aiPoweredBookmarkSearchFlow',
    inputSchema: AiPoweredBookmarkSearchInputSchema,
    outputSchema: AiPoweredBookmarkSearchOutputSchema,
  },
  async input => {
    const {output} = await aiPoweredBookmarkSearchPrompt(input);
    return output!;
  }
);
