"use server";

import { aiPoweredBookmarkSearch } from "@/ai/flows/ai-powered-bookmark-search";
import { indexBookmarks } from "@/ai/flows/bookmark-semantic-indexing";
import { dummyBookmarks } from "@/lib/bookmarks";

export async function handleSearch(query: string) {
  if (!query) {
    throw new Error("Search query cannot be empty.");
  }
  
  try {
    const searchResults = await aiPoweredBookmarkSearch({
      query,
      bookmarks: dummyBookmarks,
    });
    return searchResults;
  } catch (error) {
    console.error("Error during AI-powered search:", error);
    throw new Error("Failed to perform search. Please try again.");
  }
}

export async function handleIndex() {
    try {
        const result = await indexBookmarks({
            bookmarks: dummyBookmarks,
        });
        return result;
    } catch(error) {
        console.error("Error during bookmark indexing:", error);
        return {
            success: false,
            message: "An error occurred during indexing."
        }
    }
}
