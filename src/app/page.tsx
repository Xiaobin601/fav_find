"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Bookmark,
  Search,
  Sparkles,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type Bookmark as BookmarkType } from "@/lib/bookmarks";

// Helper function to flatten the bookmark tree from Chrome API
const flattenBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]): BookmarkType[] => {
  const bookmarks: BookmarkType[] = [];
  const stack = [...nodes];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;

    if (node.url && node.title) {
      bookmarks.push({
        title: node.title,
        url: node.url,
        description: node.title, // Chrome bookmarks don't have descriptions by default
      });
    }
    if (node.children) {
      stack.push(...node.children);
    }
  }
  return bookmarks.reverse();
};


export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

  useEffect(() => {
    // This code runs only in the context of a Chrome extension
    if (window.chrome && window.chrome.bookmarks) {
      chrome.bookmarks.getTree((bookmarkTree) => {
        try {
          const flattened = flattenBookmarks(bookmarkTree);
          setBookmarks(flattened);
        } catch (e) {
            setError("Could not read your bookmarks. Please ensure the extension has bookmark permissions.");
        } finally {
            setIsLoading(false);
        }
      });
    } else {
        // Fallback for when not running as an extension
        setError("This app is designed to be run as a Chrome extension. Please load it through chrome://extensions.");
        setIsLoading(false);
    }
  }, []);
  
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) {
      return bookmarks;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return bookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(lowerCaseQuery) ||
        bookmark.url.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchQuery, bookmarks]);


  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The filtering is now handled by the `useMemo` hook, 
    // so this function just prevents the default form submission.
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    if (searchQuery && filteredBookmarks.length === 0) {
         return (
             <div className="text-center py-10">
                <p className="text-muted-foreground">No bookmarks found matching your search.</p>
              </div>
          );
    }
    if (filteredBookmarks.length > 0) {
        return (
            <div className="space-y-3 animate-in fade-in-50 duration-500">
              {filteredBookmarks.map((item, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="group">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                            <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            {item.title}
                        </CardTitle>
                    </a>
                  </CardHeader>
                  <CardContent>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary/80 hover:underline truncate block mt-2">
                        {item.url}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
        )
    }
    
    return (
        <div className="text-center py-10">
          <Sparkles className="mx-auto h-12 w-12 text-primary/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            {`Loaded ${bookmarks.length} bookmarks.`}
          </p>
           <p className="mt-1 text-xs text-muted-foreground">
            Start typing to search your bookmarks.
          </p>
        </div>
    );
  };


  return (
    <main className="min-h-screen bg-background flex items-start justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="w-full shadow-2xl shadow-primary/10 border-none">
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center mb-6">
                  <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <Bookmark className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">FavFind</h1>
                  <p className="text-muted-foreground mt-1">
                    Your intelligent bookmark search assistant.
                  </p>
                </div>

                <form onSubmit={onSearchSubmit} className="mb-6">
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={`Search ${bookmarks.length > 0 ? bookmarks.length : ''} bookmarks...`}
                        className="pl-10 h-12 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-9"
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                    </div>
                </form>

                <div className="mt-6 min-h-[200px]">{renderContent()}</div>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
