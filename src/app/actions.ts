"use server";

import { aiPoweredBookmarkSearch } from "@/ai/flows/ai-powered-bookmark-search";
import { indexBookmarks } from "@/ai/flows/bookmark-semantic-indexing";
import type { Bookmark } from "@/lib/bookmarks";

export async function handleSearch(query: string, bookmarks: Bookmark[]) {
  if (!query) {
    throw new Error("Search query cannot be empty.");
  }
  
  try {
    const searchResults = await aiPoweredBookmarkSearch({
      query,
      bookmarks,
    });
    return searchResults;
  } catch (error) {
    console.error("Error during AI-powered search:", error);
    throw new Error("Failed to perform search. Please try again.");
  }
}

export async function handleIndex(bookmarks: Bookmark[]) {
    try {
        const result = await indexBookmarks({
            bookmarks,
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
